import React, { useState, useEffect, PropsWithChildren } from "react";
import cn from "classnames";
import { connect } from "react-redux";
import { find } from "lodash";

import { uploadFile, uploadFileCancel, createNotification } from "actions";
import { isUploading, getUpload } from "reducers/selector";
import { RootState } from "reducers/types";
import { ErrorMessage } from "@hookform/error-message";
import { FILE_UPLOAD_CATEGORY } from "actions/upload/uploadFile";
import { ConnectForm, FormContextType } from "components/fields/ConnectForm";

interface Props extends PropsWithChildren {
  name: string;
  info: string;
  className: string;
  onUpload: (url: string) => void;
  accept: string;
  icon?: React.ReactElement;
  isVisible?: boolean;
  category: FILE_UPLOAD_CATEGORY;
  disabled?: boolean;
  issueToken?: string;
}

interface ConnectedProps extends Props {
  uploadedFile?: string;
  uploadFile: typeof uploadFile;
  uploadFileCancel: typeof uploadFileCancel;
  createNotification: typeof createNotification;
  isUploading: boolean;
}

interface ConnectedFormProps extends ConnectedProps {
  formContext: FormContextType;
}

export const UploadZoneBase: React.FC<ConnectedFormProps> = (props) => {
  const [isZoneActive, setZoneActive] = useState(false);
  const [file, setFile] = useState<null | File>(null);

  const {
    isUploading,
    name,
    onUpload,
    formContext,
    uploadedFile,
    uploadFile,
    uploadFileCancel,
    isVisible,
    category,
    disabled,
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

  const handleDragEnter = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setZoneActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setZoneActive(false);
  };

  const handleDragOver = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    setZoneActive(false);

    // hack to display a more meaningful error using mimetype
    // so image/* will display "...you upload image files"
    const mimeCheck = new RegExp(props.accept.replace("*", ".*"));
    const file = find(e.dataTransfer.files, (file) => {
      return mimeCheck.test(file.type);
    });

    if (file) {
      setFile(e.dataTransfer.files[0]);
    } else {
      const type = props.accept.split("/")[0];

      props.createNotification({
        type: "Error",
        title: "This type of file is invalid",
        subTitle: `Make sure you only upload ${type} files`,
      });
    }
  };

  const dropZone = props.children || (
    <div className="text-center">
      {props.icon}
      <p className="mt-1 text-sm text-gray-600">
        <label
          className="font-medium text-brand-600 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
          htmlFor={`${props.name}-upload-photo`}
        >
          Upload a file
        </label>
        <input
          className="absolute h-0 w-0 opacity-0"
          type="file"
          multiple={false}
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          id={`${props.name}-upload-photo`}
          accept={props.accept}
        />{" "}
        or drag and drop
      </p>
      <p className="mt-1 text-xs text-gray-500">{props.info}</p>
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className="mt-2 text-sm text-red-600">{message}</p>
        )}
      />
    </div>
  );

  const uploadClass = cn(props.className, {
    "bg-brand-100 text-gray-500 text-center": isZoneActive && !isUploading,
    "bg-gray-100 text-gray-500 text-center": isUploading,
    hidden: isVisible,
  });

  const getContent = () => {
    if (isUploading) {
      return (
        <p className="flex flex-1 flex-col items-center justify-center">
          File upload in progress...
          <button
            className="mx-auto mt-4 block font-medium text-brand-600 transition duration-150 ease-in-out hover:text-brand-500 focus:underline focus:outline-none"
            onClick={() => uploadFileCancel(name)}
          >
            Click to cancel
          </button>
        </p>
      );
    }

    if (isZoneActive) {
      return (
        <p className="flex flex-1 flex-col items-center justify-center">
          Drop your file to start the upload
        </p>
      );
    } else {
      return dropZone;
    }
  };

  return (
    <div
      {...(!disabled && {
        onDrop: handleDrop,
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
      })}
      className={uploadClass}
    >
      {getContent()}
    </div>
  );
};

const UploadZoneFormElement: React.FC<ConnectedProps> = (props) => (
  <ConnectForm>
    {(formContext) => <UploadZoneBase {...props} {...formContext} />}
  </ConnectForm>
);

function mapStateToProps(state: RootState, props: Props) {
  return {
    isUploading: isUploading(state),
    uploadedFile: getUpload(state, props.name),
  };
}

export const UploadZone = connect(mapStateToProps, {
  uploadFile,
  uploadFileCancel,
  createNotification,
})(UploadZoneFormElement);
