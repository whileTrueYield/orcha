import nunjucks from "nunjucks";
import { buildToc, DocumentationTocTitle } from "./buildToc";
import { promises as fsPromises, readFileSync } from "fs";
import path from "path";
import { findIndex, flatten, last, map, reduce } from "lodash";
import { config } from "../../../config";
import { s3 } from "../../upload/s3";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import { cloudfront } from "../../upload/cloudfront";
import { format } from "date-fns";
import { buildSearchDocuments } from "../resolvers/buildSearchDocuments";
import { logger } from "../../../logger";
import { renderHtml } from "../../../markdown/render";
import { analyze } from "../../../markdown/analysis";

export const publishDocumentationTask = async (documentationId: number) => {
  logger.info(`Starting publication of documentation ${documentationId}`);

  // setup the templating engine
  const nunjucksTemplateProject = path.join(__dirname, "../../../../templates");
  nunjucks.configure(nunjucksTemplateProject, { autoescape: true });

  logger.info(`nunjucks project set to ${nunjucksTemplateProject}`);

  const documentation = await prisma.documentation.findFirstOrThrow({
    where: { id: documentationId },
  });

  const pages = await prisma.documentationPage.findMany({
    where: { documentationId },
    include: { documentationPageText: true },
  });

  logger.info(`Documentation contains ${pages.length} pages`);

  // retrieve all the titles
  const documentationTitles = buildToc(pages);

  // a page can have a sub page, this method retrieves all the titles
  // of sub pages
  const getChildrenTitles = (
    title: DocumentationTocTitle,
  ): DocumentationTocTitle[] => {
    if (title.children) {
      return [title, ...flatten(map(title.children, getChildrenTitles))];
    }
    return [title];
  };

  const sortedTitles = reduce(
    documentationTitles,
    (acc: DocumentationTocTitle[], title) => {
      if (title.children) {
        return [...acc, ...getChildrenTitles(title)];
      }
      return [...acc, title];
    },
    [],
  );

  const rootDir = `doc/${documentationId}`;
  const articleDir = path.join(rootDir, "./article");

  for (const page of pages) {
    logger.info(`Processing page ${page.title} (page ID ${page.id})`);

    // find current page in the ordered title
    const index = findIndex(sortedTitles, { id: page.id });
    const filename = sortedTitles[index].filename;
    const currentTitle = sortedTitles[index];

    const previousLink =
      index > 0
        ? {
            href: `/doc/${documentationId}/${sortedTitles[index - 1].filename}`,
            title: sortedTitles[index - 1].title,
          }
        : null;

    const nextLink =
      index + 1 < sortedTitles.length
        ? {
            href: `/doc/${documentationId}/${sortedTitles[index + 1].filename}`,
            title: sortedTitles[index + 1].title,
          }
        : null;

    // Build the page's TOC + HTML from its Markdown body (#44). `analyze` and
    // `renderHtml` share the same slugger, so the TOC `hash` links match the
    // heading ids `renderHtml` emits.
    const markdown = page.documentationPageText?.markdown ?? "";
    const bodyTitles = analyze(markdown).headings.map((heading) => ({
      level: heading.level,
      text: heading.text,
      hash: heading.anchor,
    }));

    logger.info(`Found ${bodyTitles.length} titles in page "${page.title}"`);
    const htmlBody = renderHtml(markdown);

    {
      // Full page contains the help header, the sidebar navigation
      // and all other artefacts that makes the page a complete website
      // experience
      const fullPage = nunjucks.render("page.html", {
        documentation: {
          ...documentation,
          titles: documentationTitles,
          logo: documentation.logoUrl || "/css/defaultLogo.svg",
        },
        page: {
          ...page,
          htmlBody,
          bodyTitles,
          previousLink,
          nextLink,
          section: currentTitle.parent ? currentTitle.parent.title : null,
        },
      });

      // The article page is to be embeded as an iframe in a different
      // location. This allows flexible inclusion of the documentation
      const articlePage = nunjucks.render("article.html", {
        documentation: {
          ...documentation,
          titles: documentationTitles,
          logo: documentation.logoUrl || "/css/defaultLogo.svg",
        },
        page: {
          ...page,
          htmlBody,
          bodyTitles,
          previousLink,
          nextLink,
          filename,
          section: currentTitle.parent ? currentTitle.parent.title : null,
        },
      });

      await sendFileToS3(path.join(rootDir, filename), fullPage);
      await sendFileToS3(path.join(articleDir, filename), articlePage);

      // create the first page as an index file
      if (index === 0) {
        await sendFileToS3(path.join(rootDir, "/index.html"), fullPage);
        await sendFileToS3(path.join(articleDir, "index.html"), articlePage);
      }
    }
  }

  const documents = JSON.stringify(flatten(pages.map(buildSearchDocuments)));

  // create the search engine JS and HTML
  const searchJS = nunjucks.render("search.js", { documents });
  const searchHTML = nunjucks.render("search.html", { documentation });

  // send them to S3
  await sendFileToS3(path.join(rootDir, "/search.html"), searchHTML);
  await sendFileToS3(path.join(rootDir, "/search.js"), searchJS);

  // duplicate the style (so we can update the template without impacting older docs)
  await sendFileToS3(
    path.join(rootDir, "/style.css"),
    readFileSync("templates/css/style.css", "utf8"),
  );

  // flush our CDN
  await invalidateCloudfront([path.join("/", rootDir, `/*`)]);

  await prisma.documentation.update({
    where: { id: documentationId },
    data: {
      lastPublishRequestAt: null,
      lastPublishedAt: new Date(),
      stage: ModelStage.PUBLISHED,
    },
  });
};

const invalidateCloudfront = async (paths: string[]) => {
  if (config.isDev || !config.documentationDistributionId) {
    logger.info("Skipping CloudFront invalidation (dev mode or no distribution ID configured)");
  } else {
    logger.info(
      `Invalidating cloudfront ${
        config.documentationDistributionId
      } (paths are [${paths.join(", ")}])...`,
    );

    try {
      const timestamp = format(new Date(), "yyyyMMddHHmm");
      const callerRef = `${timestamp}_${paths[0].replace("/", "_")}`;

      await cloudfront.createInvalidation({
        DistributionId: config.documentationDistributionId,
        InvalidationBatch: {
          CallerReference: callerRef,
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      });
    } catch (error) {
      logger.info(
        `Invalidating cloudfront ${config.documentationDistributionId} FAILED`,
      );
      logger.info(error);
      throw error;
    }

    logger.info("Invalidation done");
  }
};

const getContentType = (filename: string) => {
  const extension = last(filename.split("."));
  switch (extension) {
    case "js":
      return "text/javascript";
    case "htm":
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    default:
      return "text/plain";
  }
};

const sendFileToS3 = async (filename: string, content: string) => {
  if (config.isDev) {
    const outputFilename = path.join(__dirname, `../../../../out`, filename);
    // create filename project if necessary
    await fsPromises.mkdir(path.dirname(outputFilename), { recursive: true });
    // create the file
    await fsPromises.writeFile(outputFilename, content, { encoding: "utf-8" });
    logger.info(`created file ${outputFilename}...`);
  } else {
    logger.info(
      `Uploading "${filename} to S3:${config.documentationS3Bucket}...`,
    );

    try {
      await s3.putObject({
        Bucket: config.documentationS3Bucket,
        Key: filename,
        Body: content,
        ContentType: getContentType(filename),
        // CacheControl: "max-age=300", // cache for 5 minutes
      });
    } catch (error) {
      logger.info(`Error Uploading to S3`);
      logger.info(error);
      throw error;
    }

    logger.info(`Uploading to S3 done`);
  }
};

export const unpublishDocumentationTask = async (documentationId: number) => {
  const documentationProject = `doc/${documentationId}`;

  if (config.isDev) {
    const projectName = path.join(
      __dirname,
      `../../../../out`,
      documentationProject,
    );
    await fsPromises.rm(projectName, { recursive: true });
    logger.info(`deleting project ${projectName}...`);
  } else {
    logger.info(
      `Unpublishing documentation ID ${documentationId} (S3 project ${documentationProject})...`,
    );

    await s3.deleteObject({
      Bucket: config.documentationS3Bucket,
      Key: documentationProject,
    });

    logger.info("Unpublishing done");

    await invalidateCloudfront([path.join("/", documentationProject, `/*`)]);
  }

  await prisma.documentation.update({
    where: { id: documentationId },
    data: {
      stage: ModelStage.DRAFT,
      lastPublishRequestAt: null,
    },
  });
};
