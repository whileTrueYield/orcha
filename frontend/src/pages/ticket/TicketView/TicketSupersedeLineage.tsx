/**
 * TicketSupersedeLineage — the two human-facing ends of a supersession trail
 * (issue #111, ADR 0010).
 *
 * When a worked ticket's workflow changes it can't be rewritten in place: the
 * original is closed and the work continues on a new linked successor. That link
 * is the `supersededBy`/`supersedes` relation — its own relation, NOT the
 * ancestors/successors dependency DAG. Without surfacing it, a superseded
 * original reads as a plain cancellation and the trail is invisible. This file
 * renders both directions:
 *
 *   - `TicketSupersededByBanner` — on the cancelled original, a banner pointing
 *     forward to the successor ("Superseded by → TWKS-3").
 *   - `TicketSupersedesChip` — on the successor, a chip pointing back to the
 *     original ("← Superseded from TWKS-1").
 *
 * Both self-gate: each renders nothing when its relation is absent, so a ticket
 * with no lineage shows neither element. `orgId` comes from the route (same seam
 * as TicketOtherActions); navigation uses `urlResolver.ticket.view`.
 */

import { gql } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import {
  ArrowNarrowLeftIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/outline";
import cn from "classnames";
import { FCWithFragments } from "types";
import { Maybe, Ticket } from "types/graphql";
import { urlResolver } from "utils/navigation";

// A ticket carries only the fields the human reference needs — the related
// endpoints in the fragments below are partial Tickets, not the full entity.
type LineageTicket = Pick<Ticket, "id"> & {
  localId?: Maybe<number>;
  product?: Maybe<Pick<Ticket["product"] & object, "code">>;
};

// Human reference for a ticket, e.g. "TWKS-42". Falls back to "#<id>" when the
// product code or local id is missing — the same convention used across the
// ticket views (TicketOtherActions, SupersedeWorkflowModal).
const formatTicketRef = (ticket: LineageTicket): string =>
  ticket.product?.code && ticket.localId
    ? `${ticket.product.code}-${ticket.localId}`
    : `#${ticket.id}`;

interface BannerProps {
  ticket: Ticket;
  className?: string;
}

export const TicketSupersededByBanner: FCWithFragments<BannerProps> = (
  props,
) => {
  const { ticket, className } = props;
  const { orgId } = useParams<{ orgId: string }>();

  if (!ticket.supersededBy) {
    return null;
  }

  const successor = ticket.supersededBy;
  const successorRef = formatTicketRef(successor);

  return (
    <div
      className={cn(
        "mx-2 rounded-lg border-l-8 border-orange-300 bg-white p-4 shadow sm:mx-0",
        className,
      )}
    >
      <div className="flex flex-col">
        <div className="flex flex-row items-center">
          <SwitchHorizontalIcon
            className="h-6 w-6 text-orange-500"
            aria-hidden="true"
          />
          <h3 className="ml-2 text-base font-medium text-orange-700">
            This ticket was superseded
          </h3>
        </div>
        <p className="mt-2 text-sm leading-5 text-gray-600 sm:ml-8">
          Its workflow changed after work was logged, so it was closed and the
          work continued on{" "}
          <Link
            to={urlResolver.ticket.view(orgId, successor.id)}
            className="font-medium text-orange-700 underline hover:no-underline"
          >
            {successorRef} →
          </Link>
        </p>
      </div>
    </div>
  );
};

TicketSupersededByBanner.fragments = {
  TicketSupersededByBannerFragment: gql`
    fragment TicketSupersededByBannerFragment on Ticket {
      id
      supersededBy {
        id
        localId
        product {
          code
        }
      }
    }
  `,
};

interface ChipProps {
  ticket: Ticket;
  className?: string;
}

export const TicketSupersedesChip: FCWithFragments<ChipProps> = (props) => {
  const { ticket, className } = props;
  const { orgId } = useParams<{ orgId: string }>();

  // A ticket is superseded *from* at most one original today, but the relation
  // is a list (the inverse of `supersededBy`) — take the first.
  const original = ticket.supersedes?.[0];
  if (!original) {
    return null;
  }

  const originalRef = formatTicketRef(original);

  return (
    <Link
      to={urlResolver.ticket.view(orgId, original.id)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 hover:bg-orange-200",
        className,
      )}
    >
      <ArrowNarrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
      Superseded from {originalRef}
    </Link>
  );
};

TicketSupersedesChip.fragments = {
  TicketSupersedesChipFragment: gql`
    fragment TicketSupersedesChipFragment on Ticket {
      id
      supersedes {
        id
        localId
        product {
          code
        }
      }
    }
  `,
};
