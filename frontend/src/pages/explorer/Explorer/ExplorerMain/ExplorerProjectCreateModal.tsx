import { gql } from "@apollo/client";
import { Modal, ModalProps } from "components/modals/Modal";
import { Project, MutationCreateProjectArgs } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import * as yup from "yup";
import { projectFormFields } from "pages/project/formFields";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FolderIcon } from "@heroicons/react/outline";
import { FormInput } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FormError } from "components/fields/FieldError";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { FieldDescription } from "components/fields/FieldDescription";

interface Props extends ModalProps {
  parentId?: number;
  organizationId: number;
  onCreate: (project: Project) => void;
}

const schema = yup
  .object({
    name: projectFormFields.name.required(),
    parentId: projectFormFields.parentId.nullable(),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

export const ExplorerProjectCreateModal: React.FC<Props> = (props) => {
  const { organizationId, ...modalProps } = props;
  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { parentId: props.parentId },
  });

  const parentId = formContext.watch("parentId");

  const [createProject] = useBlockingMutation<
    { createProject: Project },
    MutationCreateProjectArgs
  >(CREATE_PROJECT_MUTATION, {
    refetchQueries: ["GetMiniProjectsForExplorer"],
    onError: onGraphQLError({
      title: "Project creation failed",
    }),
    onCompleted: onMutationComplete({
      title: "Project Created",
      callback: ({ createProject }) => {
        formContext.reset();
        props.onClose();
        if (props.onCreate) {
          props.onCreate(createProject);
        }
      },
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    createProject({
      variables: {
        input: {
          parentId,
          name: formData.name,
        },
      },
    });
  };

  return (
    <Modal {...modalProps} initialFocusSelector="#project-name">
      <FormProvider {...formContext}>
        <form onSubmit={formContext.handleSubmit(onSubmit)}>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
              <FolderIcon className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="mt-3 flex-1 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
                Create a new project
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="project-name" className="mb-1" required>
                    Project's name
                  </Label>
                  <FormInput
                    name="name"
                    id="project-name"
                    autoFocus
                    tabIndex={1}
                    placeholder="e.g. mocks"
                  />
                  <FormError name="name" className="mt-1" />
                </div>
                <div className="col-span-4">
                  <Label optional className="mb-1">
                    Parent Project
                  </Label>
                  <ProjectSelect
                    tabIndex={4}
                    projectId={parentId}
                    onChange={(project) =>
                      formContext.setValue(
                        "parentId",
                        project ? project.id : null
                      )
                    }
                    showUnsetButton
                  />
                  <FieldDescription className="mt-1">
                    You may only create a project inside a published project
                  </FieldDescription>
                  <FormError className="mt-1" name="projectId" />
                </div>
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
              tabIndex={3}
            >
              Cancel
            </Button>
            <Button tabIndex={2} type="submit" fullInMobile btnType="primary">
              Create Project
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProjectForExplorer($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      createdAt
      name
      parentId
      organizationId
    }
  }
`;
