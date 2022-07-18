FROM node:16-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

RUN npm ci
RUN npm install -g forever

CMD ["forever","-m=100","--minUpTime=1000","--spinSleepTime=1000","index.js"]