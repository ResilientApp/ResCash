FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production \
    PORT=8099

EXPOSE 8099

CMD ["npm", "start"]
