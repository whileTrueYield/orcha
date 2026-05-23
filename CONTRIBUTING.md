# Contributing to Orcha

Thanks for your interest in contributing. Here's how to get started.

## Development setup

```sh
make          # boots the full stack (first run takes ~3 minutes)
make watch    # enables hot-reload on file changes
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for a tour of the codebase and how
the services fit together.

## Making changes

1. Fork and clone the repo.
2. Create a branch from `main`.
3. Make your changes — keep commits focused on one logical change.
4. If you changed the Prisma schema, run `make types` to regenerate the
   GraphQL types.
5. Run the relevant tests: `make test-backend`, `make test-frontend`, or
   `make test-ai`.
6. Open a pull request with a clear description of what and why.

## What makes a good PR

- A concise title and a description that explains the motivation.
- Tests for new behavior. Bug fixes should include a test that would have
  caught the bug.
- No unrelated changes — keep the diff reviewable.

## Code of conduct

Be respectful. Assume good intent. If a disagreement gets heated, step
away and come back later. We're here to build something good together.

## Questions?

Open an issue. There's no mailing list or Discord — issues are the
canonical place for discussion.
