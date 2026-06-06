import { Menu } from "@headlessui/react";
import { differenceInMinutes, formatDistance } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "../views/Avatar";
import { PopMenu, PopMenuOption } from "../modals/PopMenu";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../fields/Button";
import cn from "classnames";
import {
  DotsHorizontalIcon,
  ReplyIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { useNotificationUrl } from "components/taskManager/hooks";
import { NotificationTarget } from "types/graphql";
import { CommentNotificationDecorator } from "./CommentNotificationDecorator";
import { Tag } from "components/tags/Tag";
import PlainTextForm from "components/PlainText/PlainTextForm";
import MarkdownView from "components/Markdown/MarkdownView";

interface Props {
  author: {
    avatarUrl: string;
    name: string;
    title?: string | null;
  };
  commentId: number;
  createdAt: string;
  updatedAt: string;
  content: string;
  onChange?: (content: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
  className?: string;
  children?: React.ReactNode;
  hasReplies?: boolean;
  cta?: any;
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

export const CommentModule: React.FC<Props> = (props) => {
  const { createdAt, updatedAt, author, children, hasReplies, commentId } =
    props;
  const [editMode, setEditMode] = useState(false);
  const notificationUrl = useNotificationUrl();
  const containerRef = useRef<HTMLDivElement>(null);
  const dateSince = formatDistance(new Date(createdAt), new Date());
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { content: props.content },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const content = watch("content", props.content);

  useEffect(() => {
    register("content");
  }, [register]);

  const menuOptions: PopMenuOption[] = [
    {
      label: "Reply",
      onClick: () => (props.onReply ? props.onReply() : null),
      type: "button",
      disabled: !props.onReply,
      icon: (className) => <ReplyIcon className={className} />,
    },
  ];

  // if onChange callback is provided, add it to that list of option
  if (props.onChange) {
    menuOptions.push({
      label: "Edit",
      onClick: () => setEditMode(true),
      type: "button",
      icon: (className) => <PencilIcon className={className} />,
    });
  }

  // if onDelete callback is provided, add it to that list of option
  if (props.onDelete) {
    menuOptions.push({ type: "separator" });
    menuOptions.push({
      label: "Delete",
      onClick: props.onDelete,
      type: "button",
      danger: true,
      icon: (className) => <TrashIcon className={className} />,
    });
  }

  const onSubmit = (data: FormSchema) => {
    if (props.onChange) {
      props.onChange(data.content);
    }
    setEditMode(false);
  };

  const cancel = (reset: boolean) => {
    if (reset) {
      setValue("content", props.content);
    }

    setEditMode(false);
  };

  const renderContent = () => {
    if (editMode) {
      return (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <PlainTextForm
              autoFocus="end"
              name="content"
              aria-invalid={errors["content"] ? "true" : "false"}
              aria-describedby={`content-field-error`}
              className="bg-white h-36 w-full max-w-none rounded-md border border-gray-300 p-4"
              placeholder="Post a comment"
            />

            <div className="mt-2 flex flex-col justify-end sm:flex-row sm:items-center">
              <Button
                type="button"
                className="mr-2"
                btnType="secondaryWhite"
                btnSize="small"
                onClick={() => cancel(true)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                btnSize="small"
                btnType="primary"
                disabled={props.content === content}
                title={
                  props.content === content
                    ? "no changes detected"
                    : "save your changes"
                }
              >
                Update Comment
              </Button>
            </div>
          </form>
        </FormProvider>
      );
    }

    return (
      <div onDoubleClick={() => props.onChange && setEditMode(true)}>
        <MarkdownView variant="light" value={content} />
      </div>
    );
  };

  const highlightComment = useMemo(
    () =>
      notificationUrl &&
      notificationUrl.target === NotificationTarget.Comment &&
      notificationUrl.targetId === commentId,
    [notificationUrl, commentId],
  );

  useEffect(() => {
    if (highlightComment && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightComment, containerRef]);

  const containerClass = cn("flex flex-row", props.className);
  const commentClass = cn(
    "rounded-r-3xl border rounded-b-3xl p-4 text-gray-800",
    {
      "ring-4 ring-pink-500 ring-offset-2 bg-pink-50 my-2": highlightComment,
      "bg-white mt-1": !highlightComment,
    },
  );

  const renderThreadLine = () => (
    <div
      className="mb-6 mt-1 flex w-12 flex-grow"
      style={{
        background:
          "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAEElEQVR42mN89OLDfwYkAAA17QO7uSsQIgAAAABJRU5ErkJggg==) center repeat-y",
      }}
    />
  );

  return (
    <div className={containerClass}>
      <div className="flex w-16 flex-none flex-col">
        <Avatar
          src={author.avatarUrl}
          className="h-16 w-16 rounded-md border-2 border-white shadow-sm"
          name={author.name}
        />
        {hasReplies ? renderThreadLine() : null}
      </div>
      <div className="ml-2 min-w-0 flex-1">
        <div className="flex flex-row justify-between text-sm">
          <div className="flex flex-row items-center">
            <span className="text-gray-600">{author.name}</span>
            {author.title ? (
              <span className="ml-2 hidden sm:inline">
                <Tag className="bg-gray-400 text-white">{author.title}</Tag>
              </span>
            ) : null}
          </div>
          <div>
            <PopMenu options={menuOptions} direction="bottom-left">
              <Menu.Button className="flex items-center rounded-full p-1 text-gray-400 hover:bg-gray-300 hover:text-gray-700 focus:text-gray-700 focus:outline-none">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Menu.Button>
            </PopMenu>
          </div>
        </div>
        <div className={commentClass} ref={containerRef}>
          {highlightComment ? <CommentNotificationDecorator /> : null}
          {renderContent()}
        </div>
        <div className="mt-1 flex flex-row justify-between sm:space-x-2">
          <span className="text-sm text-gray-500">
            <span className="hidden sm:inline">{dateSince} ago</span>
            {differenceInMinutes(new Date(updatedAt), new Date(createdAt)) >
            2 ? (
              <span className="ml-1 italic text-gray-400">(edited)</span>
            ) : null}
          </span>
          {props.cta}
        </div>
        <div className="-ml-4 sm:ml-0">{children}</div>
      </div>
    </div>
  );
};
