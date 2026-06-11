/**
 * The Markdown body seeded into every new organization's "Getting Started"
 * project (#40). Replaces the former TipTap-JSON → Yjs seed (GettingStarted
 * Project.json) now that Markdown is the source of truth (ADR 0007).
 *
 * Kept as a module constant (not a read-at-runtime .md file) so it is bundler-
 * safe and needs no filesystem access at request time.
 */

export const GETTING_STARTED_BODY = `# Welcome to Orcha 👋

This is your **Getting Started** project. Use it to find your footing — then
delete it whenever you like.

## What you can do here

- Create **tickets** for the work you want to track.
- Group related tickets under **projects**.
- Write rich notes in any body using **Markdown** — headings, lists, links,
  and \`code\`.

## Mentions & references

- Type \`@\` followed by a teammate's name to mention them — they'll be notified.
- Type \`#\` followed by a ticket number to link to it.

## Next steps

1. Open a ticket and write its description.
2. Schedule some work and watch the estimate take shape.
3. Invite a teammate and assign them a ticket.

Happy building!
`;
