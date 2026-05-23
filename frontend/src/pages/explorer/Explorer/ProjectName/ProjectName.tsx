import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { useBlockingMutation } from "utils/graphql";
import { MutationRenameProjectArgs } from "types/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import React from "react";
import "./ProjectName.css";
import { projectFormFields } from "pages/project/formFields";

interface Props extends React.PropsWithChildren {
  name: string;
  projectId: number;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: projectFormFields.name.label("Folder's Name").required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const ProjectName: FCWithFragments<Props> = (props) => {
  const textareaContainerRef = React.useRef<HTMLDivElement>(null);
  const nameFormRef = React.useRef<HTMLFormElement>(null);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { name: props.name },
    mode: "onBlur",
  });

  const name = formMethods.watch("name");

  const [renameProject] = useBlockingMutation<
    MutationReturnValue["renameProject"],
    MutationRenameProjectArgs
  >(MUTATE_UPDATE_TICKET_TITLE, {
    onError: onGraphQLError({ title: "Could not update project title" }),
    onCompleted: onMutationComplete({
      title: "Project Title Updated",
      callback: (data) => {
        formMethods.reset({
          name: data.renameProject.name,
        });
      },
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    if (formData.name !== props.name) {
      renameProject({
        variables: {
          name: formData.name.replace(/\n/g, " "),
          projectId: props.projectId,
        },
      });
    }
  };

  // Attempts to submit if the form is valid. If not valid,
  // resets the form to the original name.
  const submitForm = () => {
    if (formMethods.formState.errors.name) {
      formMethods.reset({ name: props.name });
    } else {
      nameFormRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <form
      className="flex flex-row items-center space-x-2 py-1"
      onSubmit={formMethods.handleSubmit(onSubmit)}
      ref={nameFormRef}
    >
      <FormProvider {...formMethods}>
        <div
          className="textarea-container relative inline-grid items-center p-0.5 align-top text-lg"
          ref={textareaContainerRef}
          data-value={name}
        >
          <textarea
            autoComplete="off"
            placeholder="Folder's name..."
            onInput={(e) => {
              if (textareaContainerRef.current) {
                textareaContainerRef.current.dataset.value =
                  e.currentTarget.value;
              }
            }}
            className="absolute inset-0 resize-none rounded border-0 text-gray-800 hover:ring-2 hover:ring-sky-500/25 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                formMethods.reset({ name: props.name });
                e.currentTarget.blur();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                submitForm();
                e.currentTarget.blur();
              }
            }}
            {...formMethods.register("name", {
              onBlur: (e) => {
                submitForm();
                e.currentTarget.blur();
              },
            })}
          />
        </div>
      </FormProvider>
    </form>
  );
};

ProjectName.fragments = {
  ProjectNameFragment: gql`
    fragment ProjectNameFragment on Project {
      id
      name
    }
  `,
};

const MUTATE_UPDATE_TICKET_TITLE = gql`
  mutation ExplorerRenameProject($name: String!, $projectId: Int!) {
    renameProject(name: $name, projectId: $projectId) {
      ...ProjectNameFragment
    }
  }
  ${ProjectName.fragments.ProjectNameFragment}
`;
