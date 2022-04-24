FROM node:17

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# configure the certificates for the webapp
COPY ./ssl/* /usr/ssl/
RUN cat /usr/ssl/webapp.crt >> /etc/ssl/certs/ca-certificates.crt

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 49160
EXPOSE 8080
CMD [ "node", "app.js" ]