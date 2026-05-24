FROM node:18-alpine as base
ARG node_env=production
ENV NODE_ENV $node_env
WORKDIR /orcha
COPY package.json yarn.lock ./
ADD vite-env.d.ts vite-env.d.ts
ADD vite.config.ts vite.config.ts
ADD apollo.config.js apollo.config.js
ADD postcss.config.js postcss.config.js
ADD tailwind.config.js tailwind.config.js
ADD tsconfig.json tsconfig.json
ADD index.html index.html
RUN yarn --pure-lockfile

FROM base as test
ARG node_env=test
ENV NODE_ENV $node_env
COPY src src/
COPY public public/
ADD .env .env
CMD ["yarn", "test", "-w"]

FROM base as build
COPY src src/
COPY public public/
ADD .env .env

# These defaults assume self-hosted dev with the included docker-compose.
# For a production build, override with --build-arg, for example:
#   docker build --target build \
#     --build-arg orcha_api_uri=https://api.your-domain.com \
#     --build-arg orcha_api_ws_uri=wss://api.your-domain.com \
#     --build-arg orcha_upload_cdn_uri=https://upload.your-domain.com \
#     --build-arg orcha_support_uri=https://support.your-domain.com \
#     --build-arg orcha_hostname=app.your-domain.com \
#     ./frontend
ARG orcha_api_uri="http://localhost:4000"
ARG orcha_api_ws_uri="ws://localhost:38268"
ARG orcha_upload_cdn_uri="http://localhost:9000"
ARG orcha_support_uri="http://localhost:3001"
ARG orcha_hostname="localhost"
ARG image_tag="latest"

ENV ORCHA_API_URI $orcha_api_uri
ENV ORCHA_API_WS_URI $orcha_api_ws_uri
ENV ORCHA_UPLOAD_CDN_URI $orcha_upload_cdn_uri
ENV ORCHA_SUPPORT_URI $orcha_support_uri
ENV ORCHA_HOSTNAME $orcha_hostname
ENV IMAGE_TAG $image_tag
RUN ["yarn", "build"]

FROM base as dev
ARG node_env=development
ENV NODE_ENV $node_env
COPY src src/
COPY public public/
ADD .env.development .env
# --no-open prevents the script from opening the browser in the container
CMD ["yarn", "start", "--no-open"]

# Production stage — serves pre-built assets via nginx.
# The build stage above compiles the Vite app; this stage copies the output
# and relies on nginx's default CMD to serve it.
FROM nginx:1.23-alpine as production
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /orcha/dist /www-frontend
CMD ["nginx", "-g", "daemon off;"]