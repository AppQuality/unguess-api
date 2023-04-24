FROM node:18-alpine3.16 AS node
FROM alpine:3.16 as base

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

ARG NPM_TOKEN  
RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc
RUN apk add yarn
COPY package.json ./
COPY yarn.lock ./
RUN yarn --ignore-scripts
RUN rm -f .npmrc

COPY . .

RUN yarn global add npm-run-all
RUN yarn build


FROM alpine:3.16 as web

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY --from=base /dist /app/build
COPY package*.json /app/
COPY --from=base /src/routes /app/src/routes
COPY --from=base /.git/HEAD /app/.git/HEAD
COPY --from=base /.git/refs /app/.git/refs
WORKDIR /app
RUN apk add yarn
ARG NPM_TOKEN  
RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > .npmrc
RUN yarn --prod --ignore-scripts
RUN rm -f .npmrc
CMD node build/index.js