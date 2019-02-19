FROM node:11.9.0-stretch

WORKDIR /usr/src/app

COPY . .

RUN cat package.json | sed s/localhost/server/ >package.json

RUN npm install 

EXPOSE 3000

CMD [ "npm", "start" ]

