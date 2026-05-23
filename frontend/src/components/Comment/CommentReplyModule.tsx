import { useEffect, useMemo, useRef, useState } from "react";
import { gql } from "@apollo/client";
import { Menu } from "@headlessui/react";
import { differenceInMinutes, formatDistance } from "date-fns";
import { Avatar } from "../views/Avatar";
import { PopMenu, PopMenuOption } from "../modals/PopMenu";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../fields/Button";
import cn from "classnames";
import { FCWithFragments } from "types";
import {
  CheckCircleIcon,
  DotsHorizontalIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { useNotificationUrl } from "components/taskManager/hooks";
import { NotificationTarget } from "types/graphql";
import { CommentNotificationDecorator } from "./CommentNotificationDecorator";
import { Tag } from "components/tags/Tag";
import { TipTapDecoration } from "components/TipTap/TipTapDecoration";
import TiptapForm from "components/TipTap/TipTapForm";
import Tiptap from "components/TipTap/TipTap";

interface Props {
  author: {
    avatarUrl: string;
    name: string;
    title?: string | null;
  };
  replyId: number;
  createdAt: string;
  updatedAt: string;
  content: string;
  onChange?: (content: string) => void;
  onDelete?: () => void;
  onAccept?: () => void;
  className?: string;
  acceptedAnswer?: boolean;
}

const schema = yup
  .object({
    content: yup.string().min(0).max(2048).required().label("Reply"),
  })
  .noUnknown();

type FormSchema = yup.InferType<typeof schema>;

export const CommentReplyModule: FCWithFragments<Props> = (props) => {
  const { createdAt, updatedAt, author, replyId } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationUrl = useNotificationUrl();
  const [editMode, setEditMode] = useState(false);
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
      label: "Accept Answer",
      onClick: () => (props.onAccept ? props.onAccept() : null),
      type: "button",
      disabled: !props.onAccept || props.acceptedAnswer,
      icon: (className) => <CheckCircleIcon className={className} />,
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
            <TipTapDecoration>
              <TiptapForm
                autoFocus="end"
                className="bg-white h-36 max-w-none rounded-t-md border border-gray-300 p-4"
                name="content"
                // value={content}
                aria-invalid={errors["content"] ? "true" : "false"}
                aria-describedby={`content-field-error`}
                placeholder="Leave a reply, use :emoji, mention @people and link #ticket"
              />
            </TipTapDecoration>
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
                btnType="primary"
                btnSize="small"
                disabled={props.content === content}
                title={
                  props.content === content
                    ? "no changes detected"
                    : "save your changes"
                }
              >
                Update Reply
              </Button>
            </div>
          </form>
        </FormProvider>
      );
    }

    return (
      <div onDoubleClick={() => props.onChange && setEditMode(true)}>
        <Tiptap content={content} readonly className="max-w-none" />
      </div>
    );
  };

  const renderAcceptedAnswer = () => (
    <div className="ml-2 flex flex-row items-center text-sm font-medium text-green-600">
      <CheckCircleIcon className="mr-1 h-4 w-4 text-green-400" />
      <span className="sm:hidden">Accepted</span>
      <span className="hidden sm:inline">Accepted answer</span>
    </div>
  );

  const highlightReply = useMemo(
    () =>
      notificationUrl &&
      notificationUrl.target === NotificationTarget.Reply &&
      notificationUrl.targetId === replyId,
    [notificationUrl, replyId],
  );

  useEffect(() => {
    if (highlightReply && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightReply, containerRef]);

  const containerClass = cn("flex flex-row w-full", props.className);
  const bubbleClass = cn("p-4 rounded-r-3xl rounded-b-3xl", {
    "border border-gray-200 text-gray-800": !props.acceptedAnswer || editMode,
    "border-2 border-green-400": props.acceptedAnswer && !editMode,
    "ring-4 ring-pink-500 ring-offset-2 bg-white mt-2 bg-pink-50":
      highlightReply,
    "bg-white mt-1": !highlightReply,
  });

  const avatarClass = cn("w-12 h-12 rounded-md border-2 shadow-sm", {
    "border-white": !props.acceptedAnswer || editMode,
    "border-green-400": props.acceptedAnswer && !editMode,
  });

  return (
    <div className={containerClass} ref={containerRef}>
      <div className="flex w-12 flex-none flex-col">
        <Avatar
          src={author.avatarUrl}
          className={avatarClass}
          name={author.name}
        />
      </div>
      <div className="ml-2 min-w-0 flex-grow">
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
            <PopMenu options={menuOptions} size="large" direction="bottom-left">
              <Menu.Button className="flex items-center rounded-full p-1 text-gray-400 hover:bg-gray-300 hover:text-gray-700 focus:text-gray-700 focus:outline-none">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Menu.Button>
            </PopMenu>
          </div>
        </div>
        <div className={bubbleClass}>
          {highlightReply ? <CommentNotificationDecorator /> : null}
          {renderContent()}
        </div>
        <div className="mt-1 flex flex-col justify-between sm:flex-row sm:items-center">
          <span className="ml-2 text-sm text-gray-500">
            {dateSince} ago
            {differenceInMinutes(new Date(updatedAt), new Date(createdAt)) >
            2 ? (
              <span className="ml-1 italic text-gray-400">(edited)</span>
            ) : null}
          </span>
          {props.acceptedAnswer ? renderAcceptedAnswer() : null}
        </div>
      </div>
    </div>
  );
};

CommentReplyModule.fragments = {
  CommentReplyModuleFragment: gql`
    fragment CommentReplyModuleFragment on CommentReply {
      id
      body
      createdAt
      updatedAt
      author {
        id
        title
        name
        avatarUrl
      }
    }
  `,
};
