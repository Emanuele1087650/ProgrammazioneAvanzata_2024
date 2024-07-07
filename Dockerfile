FROM node:18

WORKDIR /usr/app

COPY package*.json .

RUN npm install

CMD [ "npm", "start" ]
#CMD [ "tail", "-f", "/dev/null" ]