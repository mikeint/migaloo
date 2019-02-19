FROM node:11.9.0-stretch

WORKDIR /usr/src/app

COPY . .

RUN npm install 

RUN npm install -g nodemon

EXPOSE 5000

CMD [ "nodemon", "server.js" ]

