FROM alpine:3.6

RUN apk add --update nodejs \
	           nodejs-npm 

COPY package.json /app/package.json

WORKDIR /app

RUN apk --update add  --virtual native-dep \
  make gcc g++ python libgcc libstdc++ && \
  npm  install --silent && \
  apk del native-dep
RUN apk add bash
COPY . /app
RUN npm install -g nodemon
RUN npm run build
CMD ["node","/app/lib/standalone/start-server.js"]
# This can be overwritten later
EXPOSE 3020

