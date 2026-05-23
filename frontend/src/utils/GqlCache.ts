import { InMemoryCache } from "@apollo/client";
import { findIndex, get } from "lodash";
import {
  PaginatedTickets,
  MiniDocumentationPage,
  Ticket,
  CommentReply,
} from "types/graphql";

export default new InMemoryCache({
  typePolicies: {
    Documentation: {
      fields: {
        titles: {
          merge(
            _: MiniDocumentationPage[] | undefined,
            incoming: MiniDocumentationPage[],
          ) {
            return incoming;
          },
        },
      },
    },
    Comment: {
      fields: {
        replies: {
          merge(existing: CommentReply[] = [], incoming: CommentReply[]) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    Query: {
      fields: {
        // handles fetchMore(cursor) of tickets
        moreTickets: {
          read(existing?: PaginatedTickets): PaginatedTickets | undefined {
            if (existing) {
              return {
                totalCount: existing.totalCount,
                pageInfo: existing.pageInfo,
                nodes: existing.nodes,
              };
            }
          },
          merge(
            existing: PaginatedTickets | undefined,
            incoming: PaginatedTickets,
            { readField, args },
          ) {
            const isNew = !get(args, "cursor");
            // we only accumulate records if a cursor was specified,
            // otherwise we consider this to be the first fetch request
            // and we should flush any pre-existing cached values
            const nodes = isNew ? [] : existing ? [...existing.nodes] : [];

            incoming.nodes.forEach((ticket: Ticket) => {
              const position = findIndex(
                nodes,
                (node) => readField("id", node) === ticket.id,
              );

              if (position > -1) {
                nodes[position] = ticket;
              } else {
                nodes.push(ticket);
              }
            });

            return {
              totalCount: incoming.totalCount,
              pageInfo: incoming.pageInfo,
              nodes,
            };
          },
        },
        moreTicketsForProject: {
          read(existing?: PaginatedTickets): PaginatedTickets | undefined {
            if (existing) {
              return {
                totalCount: existing.totalCount,
                pageInfo: existing.pageInfo,
                nodes: existing.nodes,
              };
            }
          },
          merge(
            existing: PaginatedTickets | undefined,
            incoming: PaginatedTickets,
            { readField, args },
          ) {
            const isNew = !get(args, "cursor");
            // we only accumulate records if a cursor was specified,
            // otherwise we consider this to be the first fetch request
            // and we should flush any pre-existing cached values
            const nodes = isNew ? [] : existing ? [...existing.nodes] : [];

            incoming.nodes.forEach((ticket: Ticket) => {
              const position = findIndex(
                nodes,
                (node) => readField("id", node) === ticket.id,
              );

              if (position > -1) {
                nodes[position] = ticket;
              } else {
                nodes.push(ticket);
              }
            });

            return {
              totalCount: incoming.totalCount,
              pageInfo: incoming.pageInfo,
              nodes,
            };
          },
        },
      },
    },
  },
});
