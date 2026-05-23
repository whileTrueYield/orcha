import { map } from "lodash";
import prisma from "../prisma";
import { generateBlocks } from "./blocks";

export const createFolder = async (
  folderName: string,
  organizationId: number,
  authorId: number
) => {
  const folder = await prisma.folder.create({
    data: {
      path: folderName,
      organizationId: organizationId,
      authorId: authorId,
    },
  });

  const folderBlocks = map(generateBlocks(), (block, position) =>
    prisma.folderDataBlock.create({
      data: {
        folderId: folder.id,
        position,
        type: block.type,
        data: JSON.stringify(block.data),
      },
    })
  );
  await Promise.all(folderBlocks);

  return folder;
};
