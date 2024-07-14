FROM node:18

WORKDIR /usr/app

COPY package*.json .
COPY src/ .

RUN npm install

CMD [ "npm", "start" ]