FROM node:24-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app/worker

CMD ["sh", "-c", "npm install && npm run dev"]
