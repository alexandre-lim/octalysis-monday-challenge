###############################################################################
# Step 1 : Builder image

FROM node:14-slim as builder

ENV APP_DIR=/usr/src/app

WORKDIR ${APP_DIR}

COPY . ./

RUN yarn install --frozen-lockfile
RUN yarn build

###############################################################################
# Step 2 : Run image

FROM node:14-slim

ARG NODE_ENV=production
ENV APP_DIR=/usr/src/app \
  NODE_ENV=${NODE_ENV} \
  PORT=8080

WORKDIR ${APP_DIR}

COPY --from=builder ${APP_DIR}/package.json ${APP_DIR}/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --from=builder ${APP_DIR}/build ./build/

EXPOSE ${PORT}

CMD [ "yarn", "start" ]
