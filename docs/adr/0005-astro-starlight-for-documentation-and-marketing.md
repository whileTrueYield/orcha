# Astro Starlight for documentation and marketing site

Orcha needs a public-facing documentation site for end users and a marketing
landing page. Both should be SEO-friendly, static, cheap to host, and built
from markdown source files so content stays in Git.

We chose Astro with the Starlight integration — marketing pages as regular
Astro pages at the root, documentation under `/docs` powered by Starlight.
One build, one deploy, one domain.

## Architecture

Single Astro project in a separate repo (`orcha-website`), deployed as a
static site:

| Concern           | Solution                         |
|-------------------|----------------------------------|
| Marketing pages   | Astro pages (root `/`)           |
| Documentation     | Starlight (`/docs`)              |
| Search            | Pagefind (built-in, client-side) |
| Source format     | Markdown / MDX                   |
| Build output      | Static HTML, zero JS by default  |
| Hosting           | DO App Platform static site      |
| Domain            | `orcha.run` (marketing + docs)   |
| App               | `app.orcha.run` (unchanged)      |

## Key decisions within this choice

- **Combined marketing + docs in one site.** Avoids paying for two static site
  deployments and keeps all SEO authority on one domain. Starlight coexists
  naturally with regular Astro pages in the same project.
- **Separate repo from the main monorepo.** The monorepo already has five
  services (backend, frontend, support, ai, cron). The website has a different
  build pipeline (Astro), different deploy target (static site), and different
  audience (public visitors). Independent deploy cycles avoid coupling.
- **Markdown as source of truth.** Content stays in Git, diffs are readable,
  anyone can contribute without learning a framework. MDX available when
  interactive components are needed.
- **Static output, no SSR.** Documentation and marketing content don't need
  server-side rendering. Pure static HTML is fastest, cheapest, and most
  SEO-friendly — fully indexable without JavaScript.
- **Minimal marketing page first, docs are the priority.** For an OSS project,
  documentation is marketing — people find it via search. A hero page with a
  CTA is enough to start; more pages can be added later.

## Considered alternatives

- **Docusaurus** — React-based, ships a heavier JS bundle. Good documentation
  tool but the SPA architecture means more JavaScript than necessary for static
  content. Harder to mix with non-docs marketing pages.
- **Next.js** — $20/mo on Vercel for what's fundamentally static content.
  Overengineered for docs + a landing page. React SSR/SSG adds complexity
  without benefit here.
- **MkDocs / Material for MkDocs** — excellent docs tool, but Python ecosystem.
  Less flexible for custom marketing pages and interactive components if needed
  later. No natural way to combine marketing + docs in one project.
- **VitePress** — solid and lightweight, but Vue ecosystem. If we ever need
  custom components, our existing knowledge is React, not Vue.
- **GitBook** — SaaS, not self-hostable. Pricing scales with team size.
  Content locked in their platform rather than Git.
