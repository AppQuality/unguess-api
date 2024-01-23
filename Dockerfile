# Stage 1: Base
FROM node:18-alpine3.16 as base

ARG NPM_TOKEN  
RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc && \
    apk add --no-cache yarn 
COPY package.json yarn.lock ./
RUN yarn --ignore-scripts && \
    rm -f .npmrc && \
    yarn global add npm-run-all
COPY . .
RUN yarn build

# Stage 2: Web
FROM node:18-alpine3.16 as web

COPY --from=base /dist /app/build
COPY --from=base /src/routes /app/src/routes
COPY --from=base /.git/HEAD /app/.git/HEAD
COPY --from=base /.git/refs /app/.git/refs
COPY package*.json /app/

WORKDIR /app
ARG NPM_TOKEN
RUN apk add --no-cache yarn && \
    echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc && \
    yarn --prod --ignore-scripts && \
    rm -f .npmrc && \
    rm -rf /var/cache/apk/* && \
    yarn cache clean

CMD node build/index.js
