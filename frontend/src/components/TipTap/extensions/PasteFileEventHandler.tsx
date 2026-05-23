import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { uploadFileToCdn } from "upload/uploadFile";

export const PasteFileEventHandler = Extension.create({
  name: "pasteFileEventHandler",

  addProseMirrorPlugins() {
    const insertImage = (file: File) => {
      // TODO: get rid of the hardcoded "organization" string
      // we should only allow organization images to be uploaded
      uploadFileToCdn(file, "organization").then((url) => {
        // insert image into editor
        this.editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: url,
            },
          })
          .run();
      });
    };

    const getImageFile = (files?: FileList) => {
      const file = files?.[0];
      if (file?.type.startsWith("image/")) {
        return file;
      }
    };

    return [
      new Plugin({
        key: new PluginKey("pasteFileEventHandler"),
        props: {
          handleDrop(view, event) {
            // insert an image on drop (if the drop data contains an image file)
            const imageFile = getImageFile(event.dataTransfer?.files);
            if (imageFile) {
              insertImage(imageFile);
              event.preventDefault();
            }
          },
          handlePaste(view, event) {
            // insert an image on paste (if the pasted data contains an image file)
            const imageFile = getImageFile(event.clipboardData?.files);
            if (imageFile) {
              insertImage(imageFile);
              event.preventDefault();
            }
          },
        },
      }),
    ];
  },
});
