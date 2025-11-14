FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

RUN npx node ace build --ignore-ts-errors

ENV NODE_ENV=production
EXPOSE 3333

CMD ["node", "build/bin/server.js"]