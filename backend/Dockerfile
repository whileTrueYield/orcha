# Production Dockerfile for the Orcha backend.
#
# Shared by four DO App Platform components — api, cron, hocuspocus, and
# the pre-deploy migration job. Each overrides CMD via run_command in the
# app spec:
#
#   api:        node dist/server.js
#   cron:       node dist/cron.js
#   hocuspocus: node dist/hocuspocus/server.js
#   migrate:    npx prisma migrate deploy

FROM node:20-alpine

WORKDIR /orcha

# Native build deps for bcrypt and weak-napi
RUN apk --no-cache add git make cmake g++ python3 openssl

COPY package.json yarn.lock ./
ENV CMAKE_POLICY_VERSION_MINIMUM=3.5
RUN yarn --pure-lockfile

COPY prisma prisma/
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN yarn prisma generate

COPY tsconfig.json ./
COPY assets assets/
COPY src src/

COPY templates templates/
COPY tailwind.config.js ./
RUN yarn tailwindcss -i ./templates/input.css -o ./templates/css/style.css

RUN yarn tsc

ENV NODE_ENV=production