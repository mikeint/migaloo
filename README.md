# HireRanked 
 
### /client - npm start
### /server - npm run server

### draw.io connect to github for diagrams

## Download local postgres client for windows
https://gareth.flowers/postgresql-portable/

## Docker Setup 
Download docker for your platform: https://www.docker.com/get-started 
in the root of the repo run the following commands: 

### docker-compose build 
### docker-compose up 

This will bring up the database, server, and client applications. Docker has been setup to be completely optional, all code should continue to function the old way. The docker setup keeps the node modules completely separate from any other project, as the containers are isolated environments

The ports for everything is the same as the regular npm setup.
