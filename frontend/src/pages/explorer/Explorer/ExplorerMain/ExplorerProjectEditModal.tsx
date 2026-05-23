import { gql } from "@apollo/client";
import { Modal, ModalProps } from "components/modals/Modal";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import * as yup from "yup";
import { projectFormFields } from "pages/project/formFields";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FolderIcon } from "@heroicons/react/solid";
import { FormInput } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { useHistory } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { useEffect } from "react";
import { MutationUpdateProjectNameArgs, Project } from "types/graphql";
import { FCWithFragments } from "types";

interface Props extends ModalProps {
  project: Project;
  redirectOnUpdate?: boolean;
}

const schema = yup
  .object({
    name: projectFormFields.name.required(),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

export const ExplorerProjectEditModal: FCWithFragments<Props> = (props) => {
  const { project, ...modalProps } = props;
  const history = useHistory();
  const name = project.name;

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      name,
    },
  });

  const { reset } = formContext;
  useEffect(() => {
    reset({ name: name });
  }, [name, reset]);

  const [updateProjectName] = useBlockingMutation<
    { updateProjectName: Project },
    MutationUpdateProjectNameArgs
  >(UPDATE_PROJECT_PATH_MUTATION, {
    refetchQueries: ["GetMiniProjectsForExplorer", "GetProjectsForExplorer"],
    onError: onGraphQLError({
      title: "Project update failed",
    }),
    onCompleted: onMutationComplete({
      title: "Project Updated",
      callback: ({ updateProjectName }) => {
        props.onClose();
        if (props.redirectOnUpdate) {
          history.push(
            urlResolver.explorer.listing(
              project.organizationId,
              updateProjectName.id
            )
          );
        }
      },
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    updateProjectName({
      variables: {
        projectId: project.id,
        name: formData.name,
      },
    });
  };

  return (
    <Modal {...modalProps} initialFocusSelector="#project-name">
      <FormProvider {...formContext}>
        <form onSubmit={formContext.handleSubmit(onSubmit)}>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-50 sm:mx-0 sm:h-10 sm:w-10">
              <FolderIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
                Rename Folder
              </h3>
              <div className="mt-4">
                <Label htmlFor="project-name" className="mb-1">
                  Folder's name
                </Label>
                <FormInput
                  name="name"
                  id="project-name"
                  autoFocus
                  placeholder="e.g. mocks"
                />
              </div>
            </div>
          </div>
          <div className="mt-5 flex-col-reverse sm:mt-4 sm:flex sm:flex-row sm:justify-end">
            <Button
              onClick={props.onClose}
              type="button"
              fullInMobile
              btnType="secondaryWhite"
              autoFocus
              className="mb-3 sm:mb-0 sm:mr-3"
            >
              Cancel
            </Button>
            <Button type="submit" fullInMobile btnType="primary">
              Update Folder
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

const UPDATE_PROJECT_PATH_MUTATION = gql`
  mutation UpdateProjectPathForExplorer($projectId: Int!, $name: String!) {
    renameProject(name: $name, projectId: $projectId) {
      id
      name
    }
  }
`;

ExplorerProjectEditModal.fragments = {
  ExplorerProjectEditModalFragment: gql`
    fragment ExplorerProjectEditModalFragment on Project {
      id
      name
      organizationId
    }
  `,
};
