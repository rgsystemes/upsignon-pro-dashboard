# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 node:23
USER node

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV NODE_ENV=production

WORKDIR /home/node/upsignonpro-dashboard/back

COPY --chown=node:node back/package.json ./package.json
COPY --chown=node:node back/yarn.lock ./yarn.lock
RUN yarn install --production
COPY --chown=node:node back/scripts/ ./scripts
COPY --chown=node:node back/compiledServer ./compiledServer

WORKDIR /home/node/upsignonpro-dashboard
COPY --chown=node:node front/build/ ./front/build

CMD node back/compiledServer/server.js

EXPOSE 3001
