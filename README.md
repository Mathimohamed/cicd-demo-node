# CICD Devops
Basic directory structure
1. |----Dockerfile
2. |----server.js
4. |----.github-cicd.yml
5. |----node-modules
  ## Make the node application run locally using node server.js Tested the root  from the browser and got the expected response











   # Dockerization: Dockerize the Node js application
    Dockerfile is used to create a docker container and consists of
    FROM node:16
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD [ "node", "server.js" ]





