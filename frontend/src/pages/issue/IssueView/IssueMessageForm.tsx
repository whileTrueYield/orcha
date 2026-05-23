import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { Label } from "components/fields/Label";
import { FormTextareaGroup } from "components/fields/Textarea";
import { UploadButton } from "components/fields/UploadButton";
import { UploadZone } from "components/fields/UploadZone";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Issue } from "types/graphql";
import * as yup from "yup";
import cn from "classnames";

interface Props {
  onSave: (input: { imageUrl?: string; message?: string }) => void;
  onCancel: () => void;
  issue: Issue;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    message: yup.string().max(2048).label("Message"),
    imageUrl: yup.string().max(512),
  })
  .test(
    "has message or image url",
    "message or image url is required",
    (value) => !!(value.message || value.imageUrl)
  )
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const IssueMessageForm: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });

  const onSubmit = (formData: FormSchema) => {
    props.onSave(formData);
  };

  const { message, imageUrl } = formMethods.watch();

  const uploadButtonClass = cn(
    "mr-2 flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 font-title text-sm font-medium leading-5 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none focus:ring active:bg-gray-50 active:text-gray-800",
    {
      "pointer-events-none text-gray-300": message || imageUrl,
      "cursor-pointer text-gray-700": !message && !imageUrl,
    }
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="issue-message">
            Send a message to {props.issue.name}
          </Label>
          {imageUrl ? (
            <div className="relative">
              <img
                src={imageUrl}
                className="mt-1 h-36 w-full overflow-hidden rounded-lg object-cover"
                alt="issue upload"
              />
              <div
                onClick={() => formMethods.resetField("imageUrl")}
                className="absolute inset-0 flex animate-pulse-once cursor-pointer items-center justify-center bg-white text-lg opacity-0 transition-all duration-200 hover:opacity-75"
              >
                Click to remove image
              </div>
            </div>
          ) : (
            <UploadZone
              onUpload={() => null}
              name="imageUrl"
              className="mt-1 flex h-36 w-full flex-col"
              accept="image/*"
              info="PNG, JPG, GIF up to 10MB"
              isVisible={!!imageUrl}
              category={"organization"}
              disabled={!!message}
            >
              <FormTextareaGroup
                id="issue-message"
                name="message"
                required
                rows={6}
                autoFocus
                placeholder="Type your message here or drop an image file..."
              />
            </UploadZone>
          )}
        </div>

        <div className="mt-4 flex justify-between space-x-2">
          <Button onClick={props.onCancel} type="button" btnType="white">
            Cancel
          </Button>
          <div className="flex items-center">
            <UploadButton
              onUpload={() => null}
              name="imageUrl"
              className={uploadButtonClass}
              accept="image/*"
              label="Upload image"
              category="organization"
            />
            <Button
              type="submit"
              btnType="primary"
              disabled={formMethods.formState.isSubmitting}
            >
              Send message
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
