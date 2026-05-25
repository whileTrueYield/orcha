import { getProofOfWork } from "./getProofOfWork";

export const uploadImage = (imageContent: string, issueToken: string) => {
  return getProofOfWork()
    .then(([proof, hash]) =>
      fetch(`${import.meta.env.VITE_API_URI}/file_upload_req_unverified`, {
        body: JSON.stringify({
          proof,
          hash,
          token: issueToken,
          domain: "organization",
        }),
        credentials: "include",
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    )

    .then((response) => response.json())
    .then(async ({ data }): Promise<string> => {
      console.log(data);
      const awsFields: { [key: string]: string } = data.fields;
      const awsUploadUrl: string = data.url;

      // this nice trick converts an imageDataUrl into a file obj
      const file = await fetch(imageContent)
        .then((response) => response.blob())
        .then(
          (blob) => new File([blob], "screenshot.png", { type: blob.type })
        );

      const formData = new FormData();
      formData.append("Content-Type", file.type);
      Object.entries(awsFields).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", file);

      await fetch(awsUploadUrl, {
        body: formData,
        mode: "cors",
        method: "POST",
      });

      return `${import.meta.env.VITE_UPLOADS_CDN_URL}/${data.fields.key}`;
    })
    .catch((error) => {
      window.alert(
        "Your support request and its description has been successfully submitted but we were not able to include your screenshot."
      );
      throw error;
    });
};
