FROM node:8

WORKDIR /usr/src/app

COPY . .

RUN cat package.json | sed s/localhost/server/ >package.json

RUN npm install 

EXPOSE 3000

CMD [ "npm", "start" ]

