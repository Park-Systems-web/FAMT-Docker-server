FROM node:16-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

RUN npm ci
RUN npm install -g forever

CMD ["forever","index.js"]