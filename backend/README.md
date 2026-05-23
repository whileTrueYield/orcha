# orcha-backend

![Node.js CI](https://github.com/orchalabs/orcha-backend/workflows/Node.js%20CI/badge.svg)

This it the GraphQL backend for orcha

## Setup

Orcha backend is a nodeJS service written in typescript. Yarn is used to manage
dependencies and the build processes.

This guideline is for the developer only. To setup Orcha backend in staging, use
the [server how-to](docs/server-how-to.md) documentation instead.

### Installing dependencies

We'll use [volta](https://volta.sh/) to manage this project's javascript
toolchain.

With Volta installed, tools and their appropriate versions will automatically be
installed and used when navigating to a directory with a project.json that has a
volta section like so:

```json
"volta": {
  "node": "16.17.1",
  "yarn": "1.22.17"
},
```

Add any required tools and bump versions there as necessary.

NOTE: the Node version used should be the same as that specified in this
projects Dockerfile

```sh
FROM keymetrics/pm2:16-alpine as base
```

With the appropriate versions of Node and Yarn installed, you can install
dependencies in the the root of this repository with:

```sh
yarn install
```

## Dev environment

To set up your local development environment, consult
[this README](https://github.com/orchalabs/orcha-infra/blob/main/README.md).

### Database commands

To migrate your local database and populate it with helpful mock data, run:

```sh
yarn dev:db:migrate
yarn dev:mock
```

When developing and changing the DB structure (aka. editing the schema file),
you should be using to apply your changes without creating a migration file.

```sh
yarn dev:db:push
```

once your work on the new schema is finalize, you can create a migration file

```sh
yarn dev:db:migrate
```

This will also likely flush your local database (but won't on production).
Don't forget to include the generated migration script to your final commit.

### Mocking

Note that you need to have the TILT environment up and running prior to mocking, you'll also require a synch DB schema (see above). You can generate mocks for your dev environmment using

```sh
yarn dev:mock
```

This will trigger a random scenario with tickets, assignees, past work etc... It will also enqueue a schedule request to the AI for the rest of the work one minute after the mock generation (you won't see a complete schedule until this task complete).

### Database admin GUI

For a convenient database UI, run:

```sh
yarn studio
```

Studio is also run via our docker compose script, you should always have access to it at http://localhost:5555

### VAPID notification

While it shouldn't be necessary, you might want to generate your own local dev VAPID keys for some reason.
The following command will generate a public and a private key (as JSON) witht he following:

```sh
yarn web-push generate-vapid-keys --json
```

The VAPID keys are defined in our infra repository for staging and production. While in DEV using docker, we use the `.env` file at the root of this repository to define them:

```sh
__DOCKER_VAPID_PUBLIC_KEY=<your-public-key>
__DOCKER_VAPID_PRIVATE_KEY=<your-private-key>
```

### Working with migrations under active development

To test out schema changes on the fly, use the helpful command:

```sh
yarn dev:db:push
```

This way you can see your changes live in dev, before committing to them with
`yarn db:migrate`.

## Quality

### Unit-tests

We use jest to run our tests. To create the `pgtest` database in the app's
postgres container, run:

```sh
yarn test:initdb
```

Now you can run tests with:

```sh
yarn test
```

## Types export to frontend

In order for the frontend to verify type compatibility with the backend, the
backend exports its types in a single file that must be moved to the frontend
repository.

To generate the `src/generated/graphql.ts` type file and copy them to the
frontend folder of this repository:

```sh
yarn types
```
