import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { Label } from "components/fields/Label";
import TiptapForm from "components/TipTap/TipTapForm";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Issue } from "types/graphql";
import * as yup from "yup";

interface Props {
  onSave: (note: string) => void;
  onCancel: () => void;
  issue: Issue;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    note: yup.string().required().max(2048).label("Note"),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const IssueNoteForm: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });

  const onSubmit = (formData: FormSchema) => {
    props.onSave(formData.note);
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div>
          <Label
            htmlFor="issue-note"
            additionalInfo="notes are not visible to the customer."
          >
            Create a new note
          </Label>
          <TiptapForm
            name="note"
            autoFocus
            placeholder="Type your note here..."
            className="mt-1 max-w-none rounded-md border bg-white p-4 shadow-sm"
          />
        </div>

        <div className="mt-4 flex justify-between space-x-2">
          <Button onClick={props.onCancel} type="button" btnType="white">
            Cancel
          </Button>
          <Button type="submit" btnType="primary">
            Add Note
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
