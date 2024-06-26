# FROM node:18-alpine AS development
# WORKDIR /app
# COPY package.json ./

# COPY yarn.lock ./

# RUN yarn install --frozen-lockfile

# COPY . .

# RUN yarn build

# FROM node:18-alpine AS production
# ARG NODE_ENV=production
# ENV NODE_ENV=${NODE_ENV}
# WORKDIR /app
# COPY .env /app/.env

# COPY package.json ./

# COPY yarn.lock ./
# RUN yarn install 
# COPY --from=development /app/dist ./dist

# EXPOSE 4000
# CMD ["yarn", "start"]
# Stage 1: Development
FROM node:18-alpine AS development
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all source files and build the project
COPY . .
RUN yarn build

# Stage 2: Production
FROM node:18-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

# Copy necessary files and install production dependencies
COPY .env /app/.env
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built files from the development stage
COPY --from=development /app/dist ./dist

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["yarn", "start"]
