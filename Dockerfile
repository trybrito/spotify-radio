FROM node:16-slim
# The Slim version of node 17 image, is based on Ubuntu, and for that, e have to execute the commands below

RUN apt-get update && apt-get install -y sox libsox-fmt-mp3
# libsox-fml-all => to download the support library for all audio formats

WORKDIR /spotify-radio/
COPY package.json *.lock /spotify-radio/
RUN yarn
COPY . .

USER node
# to ensure that, in case of invasion, the invasor will not have external access

CMD yarn dev
