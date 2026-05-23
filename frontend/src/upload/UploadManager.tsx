import { createNotification } from "actions";
import {
  FILE_UPLOAD_CATEGORY,
  uploadFileSuccess,
} from "actions/upload/uploadFile";
import { ApiUri, UploadCdnUri } from "config";
import { map } from "lodash";
import { getProofOfWork } from "pages/auth/Login/getProofOfWork";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { getUploadRequests } from "reducers/selector";
import { useAppDispatch } from "store";

export const UploadManager: React.FC = () => {
  const fileUploadRequests = useSelector(getUploadRequests);

  return (
    <Fragment>
      {map(fileUploadRequests, (req) => (
        <UploadManagerInstance
          key={req.name}
          name={req.name}
          category={req.category}
          file={req.file}
          issueToken={req.issueToken}
        />
      ))}
    </Fragment>
  );
};

interface Props {
  name: string;
  category: FILE_UPLOAD_CATEGORY;
  file: File;
  issueToken?: string;
}

const UploadManagerInstance: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();

  const { name, file, category, issueToken } = props;

  const [awsUploadUrl, setAwsUploadUrl] = useState<string>();
  const [awsFields, setAwsFields] = useState<{ [key: string]: string } | null>(
    null
  );

  if (awsFields && awsUploadUrl) {
    // The upload requires a FormData format. It also requires
    // all the AWS credentials and file infos collected previously
    // to be sent to AWS
    const formData = new FormData();
    formData.append("Content-Type", file.type);
    Object.entries(awsFields).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);

    fetch(awsUploadUrl, {
      body: formData,
      mode: "cors",
      method: "POST",
    })
      .then(() => {
        dispatch(uploadFileSuccess(UploadCdnUri + "/" + awsFields.key, name));
      })
      .catch(() => {
        dispatch({
          type: "UPLOAD_FILE_FAILURE",
          payload: { name },
        });

        // we also want to display an error message regarding the upload
        dispatch(
          createNotification({
            type: "Error",
            title: "File Upload Error",
            subTitle: "Something went wrong, please try again later",
          })
        );
      });
  } else {
    if (issueToken) {
      getProofOfWork()
        .then(([proof, hash]) =>
          fetch(`${ApiUri}/file_upload_req_unverified`, {
            body: JSON.stringify({
              proof,
              hash,
              token: issueToken,
              domain: category,
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
        .then(({ data }) => {
          setAwsFields(data.fields);
          setAwsUploadUrl(data.url);
        });
    } else {
      fetch(`${ApiUri}/file_upload_req`, {
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
          setAwsFields(data.fields);
          setAwsUploadUrl(data.url);
        });
    }
  }

  return null;
};
