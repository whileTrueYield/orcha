import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { RootState } from "reducers/types";
import { isUploading, getUpload } from "reducers/selector";
import { uploadFile, uploadFileCancel } from "actions";
import { ConnectForm, FormContextType } from "./ConnectForm";
import { ErrorMessage } from "@hookform/error-message";
import { FILE_UPLOAD_CATEGORY } from "actions/upload/uploadFile";

interface Props {
  name: string;
  className: string;
  label: string;
  onUpload: (url: string) => void;
  accept: string;
  category: FILE_UPLOAD_CATEGORY;
  issueToken?: string;
}

interface ConnectedProps extends Props {
  uploadedFile?: string;
  uploadFile: typeof uploadFile;
  uploadFileCancel: typeof uploadFileCancel;
  isUploading: boolean;
}

interface ConnectedFormProps extends ConnectedProps {
  formContext: FormContextType;
}

const UploadButtonBase: React.FC<ConnectedFormProps> = (props) => {
  const [file, setFile] = useState<null | File>(null);

  const {
    isUploading,
    name,
    onUpload,
    formContext,
    uploadedFile,
    uploadFile,
    uploadFileCancel,
    category,
    issueToken,
  } = props;

  const {
    register,
    setValue,
    formState: { errors },
  } = formContext;

  useEffect(() => {
    file && uploadFile(file, name, category, issueToken);

    return () => {
      uploadFileCancel(name);
    };
  }, [uploadFileCancel, uploadFile, file, name, category, issueToken]);

  useEffect(() => {
    if (uploadedFile) {
      onUpload(uploadedFile);
      setValue(name, uploadedFile);
    }
  }, [onUpload, uploadedFile, setValue, name]);

  useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <>
      <label className={props.className} htmlFor={`${props.name}-upload-photo`}>
        {isUploading ? "Cancel" : props.label}
        {isUploading ? (
          <input
            id={`${props.name}-upload-photo`}
            className="absolute h-0 w-0 opacity-0"
            type="button"
            onClick={() => props.uploadFileCancel(props.name)}
          />
        ) : (
          <input
            className="absolute h-0 w-0 opacity-0"
            type="file"
            multiple={false}
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            id={`${props.name}-upload-photo`}
            accept={props.accept}
          />
        )}
      </label>
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className="mt-2 text-sm text-red-600">{message}</p>
        )}
      />
    </>
  );
};

const UploadButtonFormElement: React.FC<ConnectedProps> = (props) => (
  <ConnectForm>
    {(formContext) => <UploadButtonBase {...props} {...formContext} />}
  </ConnectForm>
);

function mapStateToProps(state: RootState, props: Props) {
  return {
    isUploading: isUploading(state),
    uploadedFile: getUpload(state, props.name),
  };
}

export const UploadButton = connect(mapStateToProps, {
  uploadFile,
  uploadFileCancel,
})(UploadButtonFormElement);
