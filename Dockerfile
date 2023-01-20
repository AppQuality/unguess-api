FROM alpine:3.16 as base

RUN apk add nodejs yarn
COPY package.json ./
COPY yarn.lock ./
RUN yarn --ignore-scripts

COPY . .

RUN yarn global add npm-run-all
RUN yarn build

FROM alpine:3.16 as web

COPY --from=base /dist /app/build
COPY package*.json /app/
COPY --from=base /src/routes /app/src/routes
COPY --from=base /.git/HEAD /app/.git/HEAD
COPY --from=base /.git/refs /app/.git/refs
WORKDIR /app
RUN apk add nodejs yarn
RUN yarn --prod --ignore-scripts
CMD node build/index.js