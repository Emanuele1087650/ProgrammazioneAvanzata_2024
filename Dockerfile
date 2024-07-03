FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

CMD [ "tail", "-f", "/dev/null" ]