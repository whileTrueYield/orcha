FROM node:22-alpine AS base

WORKDIR /orcha
RUN apk --no-cache add git
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

FROM base AS dev

COPY src src/
COPY public public/
COPY lib lib/
ADD tailwind.config.js tailwind.config.js
ADD tsconfig.json tsconfig.json
ADD postcss.config.js postcss.config.js
ADD webpack.config.js webpack.config.js
ADD tsconfig.lib.json tsconfig.lib.json
ADD vite-env.d.ts vite-env.d.ts
ADD vite.config.ts vite.config.ts
ADD index.html index.html
RUN ["yarn", "webpack"]

ARG node_env=development
ENV NODE_ENV $node_env
CMD ["yarn", "start"]
