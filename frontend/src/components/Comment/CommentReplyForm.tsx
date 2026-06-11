import { useEffect } from "react";
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
import { MutationAddReplyArgs, Ticket } from "types/graphql";
import { Tag } from "components/tags/Tag";
import { useBlockingMutation } from "utils/graphql";
import PlainTextForm from "components/PlainText/PlainTextForm";

interface Props {
  commentId: number;
  author: {
    avatarUrl?: string;
    name: string;
  };
  role: {
    title?: string | null;
  };
  visible: boolean;
  onHide: () => void;
  onChange?: (content: string) => void;
  className?: string;
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

export const CommentReplyFormModule: FCWithFragments<Props> = (props) => {
  const { visible, commentId, author, role } = props;
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const {
    register,
    watch,
    formState: { errors },
    reset,
  } = formMethods;
  const content = watch("content", "");

  useEffect(() => {
    register("content");
  }, [register]);

  const [addReply] = useBlockingMutation<
    { addReply: Ticket },
    MutationAddReplyArgs
  >(MUTATE_ADD_REPLY, {
    onError: onGraphQLError({ title: "Could not add reply" }),
    onCompleted: onMutationComplete({
      title: "Reply Posted",
      callback: () => {
        reset();
        cancel();
      },
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      const reply = data.addReply;

      cache.updateFragment(
        {
          id: `Comment:${commentId}`,
          fragment: gql`
            fragment NewCommentReplyFragment on Comment {
              id
              replies {
                id
                body
                createdAt
                author {
                  id
                  title
                  name
                  avatarUrl
                }
              }
            }
          `,
        },
        (data) => ({
          ...data,
          replies: [...data.replies, reply],
        })
      );
    },
  });

  const onSubmit = (data: FormSchema) => {
    addReply({
      variables: {
        commentId,
        input: { body: data.content },
      },
    });
  };

  const cancel = () => {
    props.onHide();
  };

  const renderContent = () => {
    return (
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <PlainTextForm
            autoFocus="end"
            className="h-36 w-full max-w-none rounded-md border border-gray-300 p-4"
            name="content"
            aria-invalid={errors["content"] ? "true" : "false"}
            aria-describedby={`content-field-error`}
            placeholder="Leave a reply"
          />

          <div className="mt-2 flex flex-col justify-end sm:flex-row sm:items-center">
            <Button
              type="button"
              className="mr-2"
              btnType="secondaryWhite"
              btnSize="small"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              btnSize="small"
              btnType="primary"
              disabled={trim(content).length === 0}
            >
              Post Reply
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  };

  const containerClass = cn("flex flex-row w-full", props.className);
  const bubbleClass = cn(
    "border p-4 mt-1 rounded-r-lg rounded-b-lg border-gray-200 text-gray-800 bg-white"
  );

  if (!visible) {
    return null;
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
            {role.title ? (
              <span className="ml-2">
                <Tag className="bg-gray-400 text-white">{role.title}</Tag>
              </span>
            ) : null}
          </div>
        </div>
        <div className={bubbleClass}>{renderContent()}</div>
      </div>
    </div>
  );
};

CommentReplyFormModule.fragments = {
  CommentReplyFormModuleFragment: gql`
    fragment CommentReplyFormModuleFragment on CommentReply {
      id
      body
      createdAt
      author {
        id
        title
        name
        avatarUrl
      }
    }
  `,
};

const MUTATE_ADD_REPLY = gql`
  mutation AddReply($commentId: Int!, $input: AddReplyInput!) {
    addReply(commentId: $commentId, input: $input) {
      id
      ...CommentReplyFormModuleFragment
    }
  }
  ${CommentReplyFormModule.fragments.CommentReplyFormModuleFragment}
`;
