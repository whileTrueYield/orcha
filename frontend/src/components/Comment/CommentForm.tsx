import { useEffect, useState } from "react";
import { Avatar } from "../views/Avatar";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../fields/Button";
import cn from "classnames";
import { trim } from "lodash";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { MutationCreateCommentArgs, Ticket } from "types/graphql";
import { Tag } from "components/tags/Tag";
import { useBlockingMutation } from "utils/graphql";
import TiptapForm from "components/TipTap/TipTapForm";
import { PlusIcon } from "@heroicons/react/solid";
import { TipTapDecoration } from "components/TipTap/TipTapDecoration";

interface Props {
  ticketId: number;
  author: {
    avatarUrl?: string;
    name: string;
    title?: string | null;
  };
  className?: string;
  onCreate?: () => void;
}

const schema = yup
  .object({
    content: yup
      .string()
      .min(0)
      .max(2048)
      .required()
      .label("Comment's content"),
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const CommentFormModule: FCWithFragments<Props> = (props) => {
  const { author } = props;
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const [editMode, setEditMode] = useState(false);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;
  const content = watch("content", "");

  useEffect(() => {
    register("content");
  }, [register]);

  const [createComment] = useBlockingMutation<
    { createComment: Ticket },
    MutationCreateCommentArgs
  >(MUTATE_CREATE_COMMENT, {
    onError: onGraphQLError({ title: "Could not create comment" }),
    onCompleted: onMutationComplete({
      title: "Comment Created",
      callback: () => {
        props.onCreate && props.onCreate();
        cancel(true);
      },
    }),
  });

  const onSubmit = (data: FormSchema) => {
    createComment({
      variables: {
        ticketId: props.ticketId,
        input: { body: data.content },
      },
    });
  };

  const cancel = (flush: boolean) => {
    if (flush) {
      setValue("content", "");
    }
    setEditMode(false);
  };

  const containerClass = cn("flex flex-row w-full", props.className);
  const bubbleClass = cn(
    "border p-4 mt-1 rounded-r-lg rounded-b-lg border-gray-200 text-gray-800 bg-white"
  );

  if (!editMode) {
    return (
      <div className={props.className}>
        <Button
          type="button"
          btnType="secondaryWhite"
          block
          onClick={() => setEditMode(true)}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Post New Comment
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="hidden w-12 flex-none flex-col sm:flex">
        <Avatar
          src={author.avatarUrl}
          className="h-12 w-12 rounded-md border-2 border-white shadow-sm"
          name={author.name}
        />
      </div>
      <div className="ml-2 min-w-0 flex-grow">
        <div className="flex flex-row justify-between text-sm">
          <div>
            <span className="text-gray-600">{author.name}</span>
            {author.title ? (
              <span className="ml-2">
                <Tag className="bg-gray-400 text-white">{author.title}</Tag>
              </span>
            ) : null}
          </div>
        </div>
        <div className={bubbleClass}>
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <TipTapDecoration>
                <TiptapForm
                  autoFocus="end"
                  className="h-36 max-w-none rounded-t-md border border-gray-300 p-4"
                  name="content"
                  aria-invalid={errors["content"] ? "true" : "false"}
                  aria-describedby={`content-field-error`}
                  placeholder="Post a comment, use :emoji, mention @people and link #ticket"
                />
              </TipTapDecoration>
              <div className="mt-2 flex flex-col justify-end sm:flex-row sm:items-center">
                <Button
                  type="button"
                  className="mr-2"
                  btnType="secondaryWhite"
                  btnSize="small"
                  onClick={() => cancel(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  btnSize="small"
                  btnType="primary"
                  disabled={trim(content).length === 0}
                >
                  Post New Comment
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

CommentFormModule.fragments = {
  CommentFormModuleFragment: gql`
    fragment CommentFormModuleFragment on Ticket {
      id
      comments {
        nodes {
          body
          author {
            id
            name
            title
            avatarUrl
          }
        }
      }
    }
  `,
};

const MUTATE_CREATE_COMMENT = gql`
  mutation CreateComment($ticketId: Int!, $input: CreateCommentInput!) {
    createComment(ticketId: $ticketId, input: $input) {
      ...CommentFormModuleFragment
    }
  }
  ${CommentFormModule.fragments.CommentFormModuleFragment}
`;
