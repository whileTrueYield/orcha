import { gql } from "@apollo/client";
import { BookOpenIcon, ChatAlt2Icon, CodeIcon } from "@heroicons/react/outline";
import { DocumentationSelect } from "components/fields/DocumentationSelect";
import { Input } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { ToggleButton } from "components/fields/ToggleButton";
import React, { useState } from "react";
import { FCWithFragments } from "types";
import { Documentation } from "types/graphql";

interface Props {
  productId: number;
}

export const ProductSupportEmbed: FCWithFragments<Props> = (props) => {
  const [hideButton, setHideButton] = useState(false);
  const [buttonClass, setButtonClass] = useState("");
  const [embedLanguage, setEmbedLanguage] = useState<"html" | "js">("html");
  const [documentation, setDocumentation] = useState<Documentation | null>(
    null,
  );

  const htmlEmbed = [
    "<script",
    '  defer="defer"',
    `  data-product-id="${props.productId}"`,
    `  src="${import.meta.env.VITE_SUPPORT_URI}/orcha-support.js">`,
    `</script>`,
    `<script>window.OrchaSupport = window.OrchaSupport || [];</script>`,
  ];

  const jsEmbed = [
    "(function(){",
    '  var script = document.createElement("script");',
    `  script.src = "${import.meta.env.VITE_SUPPORT_URI}/orcha-support.js";`,
    `  script.setAttribute("data-product-id", "${props.productId}")`,
    `  window.OrchaSupport = window.OrchaSupport || [];`,
    "  document.head.appendChild(script);",
    "})()",
  ];

  if (hideButton) {
    htmlEmbed.splice(3, 0, '  data-show-button="false"');
    jsEmbed.splice(3, 0, '  script.setAttribute("data-show-button", "false")');
  }

  if (documentation) {
    htmlEmbed.splice(3, 0, `  data-documentation-id="${documentation.id}"`);
    jsEmbed.splice(
      3,
      0,
      `  script.setAttribute("data-documentation-id", "${documentation.id}")`,
    );
  }

  if (buttonClass) {
    htmlEmbed.splice(3, 0, `  data-button-class="${buttonClass}"`);
    jsEmbed.splice(
      3,
      0,
      `  script.setAttribute("data-button-class", "${buttonClass}")`,
    );
  }

  const embed =
    embedLanguage === "html" ? htmlEmbed.join("\n") : jsEmbed.join("\n");

  return (
    <div>
      <p className="mt-2 text-sm leading-5 text-gray-500">
        Add Orcha Support for this product by pasting the following piece of
        code to your HTML or Javascript templates.
      </p>
      <div className="mt-4 flex flex-row items-center justify-between">
        <Label htmlFor="support-embed-code">Embed Code</Label>
        <ToggleButton
          checked={embedLanguage === "html"}
          onChange={() =>
            embedLanguage === "html"
              ? setEmbedLanguage("js")
              : setEmbedLanguage("html")
          }
          leftLabel="Javascript"
          label="HTML"
          checkedColor="bg-gray-200"
          small
        />
      </div>
      <textarea
        id="support-embed-code"
        className="mt-2 w-full rounded-md border-0 bg-gray-100 px-4 py-2 font-mono text-sm text-gray-700 shadow-inner focus:border-0 focus:ring focus:ring-brand-500 focus:ring-opacity-50"
        onFocus={(event) => event.currentTarget.select()}
        rows={embedLanguage === "html" ? htmlEmbed.length : jsEmbed.length}
        readOnly
        value={embed}
      ></textarea>
      <div className="mt-6 flex flex-row space-x-4">
        <div>
          <ChatAlt2Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between">
            <h4 className="mb-1 font-medium text-gray-700">Support Button</h4>
            <ToggleButton
              checked={!hideButton}
              onChange={() => setHideButton(!hideButton)}
              leftLabel="Hidden"
              label="Visible"
            />
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-500">
            You can hide the support button and display the support form
            yourself using the javascript command{" "}
            <span className="mt-2 rounded border bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-700">
              OrchaSupport.push(["show"])
            </span>{" "}
            or manually display the button using{" "}
            <span className="mt-2 rounded border bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-700">
              OrchaSupport.push(["showButton"])
            </span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-row space-x-4">
        <div>
          <BookOpenIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between">
            <h4 className="mb-1 font-medium text-gray-700">Documentation</h4>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-500">
            You can display documentation within the support tool to speed up
            issue resolution.
          </p>
          <div className="mt-2 max-w-xl">
            <DocumentationSelect
              value={documentation}
              onChange={(documentation) =>
                setDocumentation(documentation || null)
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-row space-x-4">
        <div>
          <CodeIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 font-medium text-gray-700">Customize Button</h4>
          <div className="flex max-w-xl flex-col">
            <p className="text-sm leading-6 text-gray-500">
              You may provide a custom CSS class to be used by the button.
            </p>

            <Input
              type="text"
              className="mt-2"
              id="custom-class"
              value={buttonClass}
              placeholder="Button CSS class"
              onChange={(event) =>
                setButtonClass(
                  event.currentTarget.value.replaceAll(/[^[0-9a-z\-_ ]/gi, ""),
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

ProductSupportEmbed.fragments = {
  ProductSupportEmbedFragment: gql`
    fragment ProductSupportEmbedFragment on Product {
      id
      isSupportActive
    }
  `,
};
