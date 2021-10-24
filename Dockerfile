FROM node:16-alpine AS builder

WORKDIR /var/infoscreens

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:16-alpine

ENV NODE_ENV production

WORKDIR /var/infoscreens

# Install NoFlo and dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY server /var/infoscreens/server
COPY --from=builder /var/infoscreens/dist /var/infoscreens/dist

# Map the volumes
VOLUME /var/infoscreens/dist
VOLUME /var/infoscreens/videos
VOLUME /var/infoscreens/pictures

EXPOSE 8080

CMD npm start

