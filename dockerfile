# Stage 1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

#Stage 1.5
FROM deps AS build
COPY . .
RUN npm run build


#Stage 2
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev


#Stage 3- imagen final
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
RUN mkdir -p public/uploads && chown -R node:node public
USER node
EXPOSE 3001
CMD ["node", "dist/main"]


#Backup del funcional

#FROM node:20-alpine

#WORKDIR /app

#COPY package*.json ./

#RUN npm install

#COPY . .

#RUN npm run build

#EXPOSE 3001

#CMD ["npm", "run", "start:prod"]