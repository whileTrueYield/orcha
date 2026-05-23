import { FILE_UPLOAD_CATEGORY } from "actions/upload/uploadFile";
import { ApiUri, UploadCdnUri } from "config";

export const uploadFileToCdn = async (
  file: File,
  category: FILE_UPLOAD_CATEGORY
): Promise<string> => {
  const { fields, uploadUrl } = await fetch(`${ApiUri}/file_upload_req`, {
    body: JSON.stringify({ domain: category }),
    credentials: "include",
    mode: "cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(({ data }) => {
      const fields: { [key: string]: string } = data.fields;
      return { fields, uploadUrl: data.url };
    });

  // The upload requires a FormData format. It also requires
  // all the AWS credentials and file infos collected previously
  // to be sent to AWS
  const formData = new FormData();
  formData.append("Content-Type", file.type);
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  formData.append("file", file);

  await fetch(uploadUrl, {
    body: formData,
    mode: "cors",
    method: "POST",
  });

  return UploadCdnUri + "/" + fields.key;
};
