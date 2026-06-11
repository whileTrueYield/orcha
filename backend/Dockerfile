# Production Dockerfile for the Orcha backend.
#
# Shared by three DO App Platform components — api, cron, and the
# pre-deploy migration job. Each overrides CMD via run_command in the
# app spec:
#
#   api:     node dist/server.js
#   cron:    node dist/cron.js
#   migrate: npx prisma migrate deploy

# Cache bust: 2026-05-24
FROM node:22-alpine

WORKDIR /orcha

# Native build deps for bcrypt and weak-napi
RUN apk --no-cache add git make cmake g++ python3 openssl

COPY package.json yarn.lock ./
ENV CMAKE_POLICY_VERSION_MINIMUM=3.5
RUN yarn --pure-lockfile

COPY prisma prisma/
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn prisma generate

COPY tsconfig.json tsconfig.build.json ./
COPY assets assets/
COPY src src/

COPY templates templates/
COPY tailwind.config.js ./
RUN yarn tailwindcss -i ./templates/input.css -o ./templates/css/style.css

# Type gate. The emit step below uses `noCheck` (it must: classic `node`
# resolution can't read the `exports.types` of our ESM-only deps), so this is
# the ONLY place type errors are caught at build time. It runs the `bundler`
# config (tsconfig.json) — the resolution mode that matches our runtime, where
# node-diff3 and the remark/unified stack resolve — and fails the image build on
# any error, blocking the deploy. Needs the generated client (above) + src.
RUN yarn typecheck

# Emit CommonJS to dist/ via the build config (tsconfig.json itself is
# `module: preserve`, for type resolution only — see tsconfig.build.json).
# This step is emit-only (`noCheck`); the gate above does the checking.
RUN yarn tsc -p tsconfig.build.json

ENV NODE_ENV=production