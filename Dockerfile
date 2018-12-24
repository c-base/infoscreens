FROM node:10-alpine

# Reduce npm install verbosity, overflows Travis CI log view
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production

EXPOSE 8080

RUN mkdir -p /var/infoscreens
WORKDIR /var/infoscreens
COPY package.json /var/infoscreens
COPY server /var/infoscreens/server
COPY dist /var/infoscreens/dist

# Install NoFlo and dependencies
RUN npm install --only=production

# Map the volumes
VOLUME /var/infoscreens/dist

CMD npm start
