FROM node:24-alpine AS deps

WORKDIR /app/worker

COPY package*.json ./
RUN npm ci

FROM deps AS build

COPY tsconfig.json ./
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime

RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production

WORKDIR /app/worker

COPY --from=build --chown=node:node /app/worker/package*.json ./
COPY --from=build --chown=node:node /app/worker/node_modules ./node_modules
COPY --from=build --chown=node:node /app/worker/dist ./dist

USER node

CMD ["node", "dist/worker.js"]
