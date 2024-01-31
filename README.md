# CICD Devops
Basic directory structure
1. |----Dockerfile
2. |----server.js
4. |----.github-cicd.yml
5. |----node-modules
   Make the node application run locally using node server.js Tested the root  from the browser and got the expected response











   # Dockerization: Dockerize the Node js application
   6. Dockerfile is used to create a docker container and consists of
   7. FROM node:16
   8. WORKDIR /usr/src/app
   9. COPY package*.json ./
   10. RUN npm install
   11. COPY . .
   12. EXPOSE 3000
   13. CMD [ "node", "server.js" ]





