FROM keymetrics/pm2:18-alpine as base
ENV NODE_ENV $node_env

WORKDIR /orcha
RUN apk --no-cache add git
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile

# Having this as an intermediary image speeds the image build
FROM base as prisma
COPY prisma prisma/
# Build the typing from the Prisma database schema file
RUN NODE_OPTIONS=--max-old-space-size=4096 yarn prisma generate


FROM prisma as production
# Using ARG to define environment variables during build phase
ARG node_env=production
# Expose API access port
EXPOSE 4000 
# Expose WebSocket access port
EXPOSE 38266

# Assigning previously captured ARG values to environment variables for the pod
ENV NODE_ENV $node_env

ADD tsconfig.json tsconfig.json
COPY assets assets/
COPY src src/

# generate the styles for the documentation
COPY templates templates/
COPY tailwind.config.js tailwind.config.js
RUN yarn tailwindcss -i ./templates/input.css -o ./templates/css/style.css

# Copy pm2 node runner config file
COPY pm2.config.js .

# Compile the TS files into javascript
RUN yarn tsc

CMD ["pm2-runtime", "start", "pm2.config.js"]


FROM prisma as hocuspocus
# Using ARG to define environment variables during build phase
ARG node_env=production
# Expose WebSocket access port
EXPOSE 38268

# Assigning previously captured ARG values to environment variables for the pod
ENV NODE_ENV $node_env

ADD tsconfig.json tsconfig.json
COPY src src/

# Copy pm2 node runner config file
COPY src/hocuspocus/pm2.config.js .

# Compile the TS files into javascript
RUN yarn tsc

CMD ["pm2-runtime", "start", "pm2.config.js"]