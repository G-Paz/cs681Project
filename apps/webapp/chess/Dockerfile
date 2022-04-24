# base image
FROM node:17

# set working directory
WORKDIR /app

# configure certificates for webapp
COPY ./ssl/* /usr/ssl/
RUN cat /usr/ssl/delegate.crt >> /etc/ssl/certs/ca-certificates.crt
RUN cat /usr/ssl/iam.crt >> /etc/ssl/certs/ca-certificates.crt

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli
RUN npm update

# add app
COPY . /app

# start app
CMD ng serve --host 0.0.0.0