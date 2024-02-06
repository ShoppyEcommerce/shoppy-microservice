FROM node:18-alpine AS development
WORKDIR /app
COPY package.json ./

COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:18-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
COPY .env /app/.env

COPY package.json ./

COPY yarn.lock ./
RUN yarn install 
COPY --from=development /app/dist ./dist

EXPOSE 4000
CMD ["yarn", "start"]