import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ticketFormFields } from "../formFields";
import { FormProvider, useForm } from "react-hook-form";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { useBlockingMutation } from "utils/graphql";
import { MutationUpdateTicketArgs } from "types/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { Tag } from "components/tags/Tag";
import React from "react";
import "./TicketTitle.css";

interface Props extends React.PropsWithChildren {
  title: string;
  ticketId: number;
  ticketLocaLId?: number | null;
  productCode?: string;
  milestone?: boolean;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    title: ticketFormFields.title.label("Ticket's title").required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const TicketTitle: FCWithFragments<Props> = (props) => {
  const textareaContainerRef = React.useRef<HTMLDivElement>(null);
  const titleFormRef = React.useRef<HTMLFormElement>(null);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { title: props.title },
    mode: "onBlur",
  });

  const title = formMethods.watch("title");

  const [updateTicketTitle] = useBlockingMutation<
    MutationReturnValue["updateTicket"],
    MutationUpdateTicketArgs
  >(MUTATE_UPDATE_TICKET_TITLE, {
    onError: onGraphQLError({ title: "Could not update ticket title" }),
    onCompleted: onMutationComplete({
      title: "Ticket Title Updated",
      callback: (data) => {
        formMethods.reset({
          title: data.updateTicket.title,
        });
      },
    }),
  });

  const onSubmit = async (formData: FormSchema) => {
    if (formData.title !== props.title) {
      updateTicketTitle({
        variables: {
          input: {
            title: formData.title.replace(/\n/g, " "),
          },
          ticketId: props.ticketId,
        },
      });
    }
  };

  // Attempts to submit if the form is valid. If not valid,
  // resets the form to the original name.
  const submitForm = () => {
    if (formMethods.formState.errors.title) {
      formMethods.reset({ title: props.title });
    } else {
      titleFormRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <form
      className="flex flex-row items-center space-x-2 px-4 py-1"
      onSubmit={formMethods.handleSubmit(onSubmit)}
      ref={titleFormRef}
    >
      {props.ticketLocaLId && props.productCode ? (
        <TicketIdTag
          productCode={props.productCode}
          className="font-sans text-sm"
          localId={props.ticketLocaLId}
          milestone={props.milestone}
        />
      ) : (
        <Tag large>DRAFT</Tag>
      )}
      <FormProvider {...formMethods}>
        <div
          className="textarea-container relative inline-grid items-center p-0.5 align-top text-lg"
          ref={textareaContainerRef}
          data-value={title}
        >
          <textarea
            autoComplete="off"
            placeholder="Ticket's title goes here..."
            onInput={(e) => {
              if (textareaContainerRef.current) {
                textareaContainerRef.current.dataset.value =
                  e.currentTarget.value;
              }
            }}
            className="absolute inset-0 resize-none rounded border-0 text-gray-800 hover:ring-2 hover:ring-sky-500/25 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                formMethods.reset({ title: props.title });
                e.currentTarget.blur();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                submitForm();
                e.currentTarget.blur();
              }
            }}
            {...formMethods.register("title", {
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

TicketTitle.fragments = {
  TicketTitleFragment: gql`
    fragment TicketTitleFragment on Ticket {
      id
      title
      milestone
    }
  `,
};

const MUTATE_UPDATE_TICKET_TITLE = gql`
  mutation UpdateTicketTitle($input: UpdateTicketInput!, $ticketId: Int!) {
    updateTicket(input: $input, ticketId: $ticketId) {
      ...TicketTitleFragment
    }
  }
  ${TicketTitle.fragments.TicketTitleFragment}
`;
