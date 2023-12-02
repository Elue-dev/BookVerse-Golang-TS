# Builder Stage
FROM node:14 AS builder

WORKDIR /app

COPY package.json .

COPY package-lock.json .

 RUN npm install\
        && npm install typescript -g

COPY . .

RUN tsc

CMD ["node", "./dist/server.js"]
