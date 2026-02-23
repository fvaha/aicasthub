# Backend Dockerfile
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx medusa build

EXPOSE 9009

CMD ["npx", "medusa", "start", "--port", "9009"]
