import React, { useState } from "react";
import { useAppDispatch } from "store";
import cn from "classnames";
import { createNotification } from "actions";
import { DocumentAddIcon } from "components/assets/DocumentAddIcon";
import { plural } from "utils/string";
import { find } from "lodash";

interface Props {
  className?: string;
  onFileRead: (content: string[][]) => void;
  rows: string[][];
}

export const UploadCsv: React.FC<Props> = (props) => {
  const { rows, onFileRead } = props;
  const [isZoneActive, setZoneActive] = useState(false);
  const dispatch = useAppDispatch();

  const uploadClass = cn(props.className, {
    "bg-brand-100 text-gray-500": isZoneActive,
    "bg-gray-100": rows.length > 0,
  });

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

  const processFile = async (file: File) => {
    import("papaparse").then(async (Papa) => {
      var csv = await Papa.parse(await file.text());
      if (csv.errors.length) {
        dispatch(
          createNotification({
            type: "Error",
            title: `Error at row ${csv.errors[0].row}`,
            subTitle: csv.errors[0].message,
          })
        );
      } else {
        onFileRead(csv.data as string[][]);
      }
      setZoneActive(false);
    });
  };

  const handleDrop = (e: React.DragEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();

    // hack to display a more meaningful error using mimetype
    // so image/* will display "...you upload image files"
    const mimeCheck = new RegExp("text/csv");
    const file = find(e.dataTransfer.files, (file) => {
      return mimeCheck.test(file.type);
    });

    if (file) {
      processFile(e.dataTransfer.files[0]);
    } else {
      dispatch(
        createNotification({
          type: "Error",
          title: "This type of file is invalid",
          subTitle: `Make sure you only upload CSV files`,
        })
      );
    }
  };

  const dropZone = (
    <div className="text-center">
      <div className="flex items-center justify-center">
        <DocumentAddIcon className="h-12 w-12 text-gray-400" />
      </div>
      <p className="mt-1 text-sm text-gray-600">
        <label
          className="mr-1 cursor-pointer font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-600 focus:underline focus:outline-none"
          htmlFor={`import-file`}
        >
          Click here to upload a file
          <input
            className="absolute h-0 w-0 opacity-0"
            type="file"
            multiple={false}
            onChange={(e) => e.target.files && processFile(e.target.files[0])}
            id="import-file"
            accept="text/csv"
          />
        </label>
        or drag and drop
      </p>
    </div>
  );

  const getContent = () => {
    if (isZoneActive) {
      return <span>Drop your file here</span>;
    } else if (rows.length > 0) {
      return (
        <div>
          <div className="text-center text-gray-700">
            {plural("{} ticket", "{} tickets", rows.length - 1)} to be imported
          </div>

          <label
            className="mr-1 mt-4 cursor-pointer text-sm font-medium text-brand-700 transition duration-150 ease-in-out hover:text-brand-600 focus:underline focus:outline-none"
            htmlFor={`import-file`}
          >
            or click here to upload another file
            <input
              className="absolute h-0 w-0 opacity-0"
              type="file"
              multiple={false}
              onChange={(e) => e.target.files && processFile(e.target.files[0])}
              id="import-file"
              accept="text/csv"
            />
          </label>
        </div>
      );
    } else {
      return dropZone;
    }
  };
  return (
    <div
      className={uploadClass}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      {getContent()}
    </div>
  );
};
