import { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useHistory,
  RouteComponentProps,
} from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { MutationDeleteTagArgs, Tag } from "types/graphql";
import { tagFormFields } from "../formFields";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MutationUpdateTagArgs } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Panel, PanelBody } from "components/views/Panel";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { useBlockingMutation } from "utils/graphql";
import { ColorSelect } from "components/fields/ColorSelect";
import { getColor } from "config";
import { usePageTitle } from "hooks/usePageTitle";
import { plural } from "utils/string";
import { FCWithFragments } from "types";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { QueryReturnValue } from "types/queryTypes";
import { PopoverTips } from "components/help/HelpBlock";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: tagFormFields.name,
    color: tagFormFields.color,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface UrlParams {
  tagId: string;
  orgId: string;
}
type Props = RouteComponentProps<UrlParams>;

export const TagEdit: FCWithFragments<Props> = () => {
  usePageTitle("Tag Edit");
  const params = useParams<UrlParams>();
  const tagId = parseInt(params.tagId);
  const [deleteTagModalVisible, setDeleteTagModalVisible] = useState(false);

  const history = useHistory();
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  useEffect(() => {
    if (formMethods.formState.isDirty) {
      activateNavConfirmation(true);
    }
  }, [formMethods.formState.isDirty, activateNavConfirmation]);

  const color = formMethods.watch("color");
  const colorSet = getColor(color);

  const { data, loading } = useQuery<QueryReturnValue["tag"]>(GET_TAG, {
    fetchPolicy: "cache-and-network",
    variables: {
      id: tagId,
    },
    onError: onGraphQLError({ title: "Could not retrieve tag" }),
    onCompleted: ({ tag }) => {
      formMethods.reset({ name: tag.name, color: tag.color });
      activateNavConfirmation(false);
    },
  });

  const [deleteTag] = useBlockingMutation<
    { deleteTag: boolean },
    MutationDeleteTagArgs
  >(DELETE_TAG_MUTATION, {
    onError: onGraphQLError({ title: "Tag Deletion failed" }),
    onCompleted: onMutationComplete({
      title: "Tag has been deleted",
      callback: () => {
        activateNavConfirmation(false);
        setTimeout(() => history.push(urlResolver.tag.listing(params.orgId)));
      },
    }),
  });

  const tag = data?.tag;

  const [updateTag] = useBlockingMutation<
    { updateTag: Tag },
    MutationUpdateTagArgs
  >(MUTATE_UPDATE_TAG, {
    onError: onGraphQLError({ title: "Could not update tag" }),
    onCompleted: onMutationComplete({
      title: "Tag has been updated",
    }),
  });

  useEffect(() => {
    formMethods.register("color");
  }, [formMethods]);

  if (loading) {
    return null;
  }

  if (!tag) {
    return null;
  }

  const onDeleteTag = () => {
    deleteTag({ variables: { tagId } });
  };

  const onSubmit = (formData: FormSchema) => {
    updateTag({
      variables: {
        input: formData,
        tagId,
      },
    });
  };

  const explorerTagUrl =
    urlResolver.search.search(params.orgId) +
    `?tag_id=${tag.id}&tag_label=${encodeURIComponent(tag.name)}`;

  return (
    <div className="flex flex-col space-y-6 px-2 pb-6 sm:px-0">
      <WarningConfirm
        title="Discard Tag Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to this tag? Once discarded changes are permanently lost."
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />
      <DangerConfirm
        onConfirm={onDeleteTag}
        visible={deleteTagModalVisible}
        onClose={() => setDeleteTagModalVisible(false)}
        title="Delete Tag"
        cta="Delete Tag"
        description="Are you sure you want to delete this tag? Tickets using
            this tag will not be deleted. This action cannot
            be undone."
      />
      <Panel>
        <PanelBody>
          <div className="flex flex-row justify-between">
            <div>
              <span
                className={`rounded-md px-3 py-1 text-base font-medium leading-6 ${colorSet.textColor} ${colorSet.bgColor} border-2 ${colorSet.borderColor}`}
              >
                {tag.name}
              </span>
              <span className="ml-2 text-lg font-medium text-gray-700">
                Tag
              </span>
            </div>
            <div>
              <Link
                to={explorerTagUrl}
                className="text-sm leading-6 text-brand-500 underline transition hover:text-brand-600 hover:no-underline"
              >
                Associated with{" "}
                {plural("{} ticket", "{} tickets", tag.ticketCount)}
              </Link>
              <PopoverTips
                title="Associated Tickets"
                className="relative top-1 inline-block px-1"
              >
                <p>
                  This count does not include draft tickets, archived tickets
                  and tickets contained in archived projects.
                </p>
              </PopoverTips>
            </div>
          </div>
          <p className="mt-4 text-sm leading-5 text-gray-500">
            Tags are associated with tickets, you may use tags to group your
            tickets together, track goals and prioritize your workforce.
          </p>
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <div className="mt-6 grid gap-4 sm:grid-cols-7">
                <div className="sm:col-span-5">
                  <Label htmlFor="tag-name" className="mb-1">
                    Tag Name
                  </Label>
                  <FormInputGroup
                    id="tag-name"
                    name="name"
                    placeholder="e.g. Release Candidate 2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="tag-name" className="mb-1">
                    Color
                  </Label>
                  <ColorSelect
                    onChange={(color) =>
                      formMethods.setValue("color", color, {
                        shouldDirty: true,
                      })
                    }
                    value={color}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col justify-end space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <Button
                  btnType="secondaryDanger"
                  type="button"
                  onClick={() => setDeleteTagModalVisible(true)}
                  fullInMobile
                >
                  Delete Tag
                </Button>
                <div className="flex flex-row-reverse">
                  <Button fullInMobile btnType="primary" type="submit">
                    Update Tag
                  </Button>
                  <Button
                    type="button"
                    fullInMobile
                    className="mr-2"
                    btnType="secondaryWhite"
                    asElement={(className) => (
                      <Link
                        to={urlResolver.tag.listing(params.orgId)}
                        className={className}
                      >
                        Cancel
                      </Link>
                    )}
                  />
                </div>
              </div>
            </form>
          </FormProvider>
        </PanelBody>
      </Panel>
    </div>
  );
};

TagEdit.fragments = {
  TagEditFragment: gql`
    fragment TagEditFragment on Tag {
      id
      name
      color
      ticketCount
      updatedAt
    }
  `,
};

const MUTATE_UPDATE_TAG = gql`
  mutation UpdateTag($input: UpdateTagInput!, $tagId: Int!) {
    updateTag(input: $input, tagId: $tagId) {
      id
      ...TagEditFragment
    }
  }
  ${TagEdit.fragments.TagEditFragment}
`;

const GET_TAG = gql`
  query getTagForEdit($id: Int!) {
    tag(id: $id) {
      id
      ...TagEditFragment
    }
  }
  ${TagEdit.fragments.TagEditFragment}
`;

const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($tagId: Int!) {
    deleteTag(tagId: $tagId)
  }
`;
