# CICD Devops
Basic directory structure
1. |----Dockerfile
2. |----server.js
4. |----.github-cicd.yml
5. |----node-modules
   Make the node application run locally using node server.js Tested the root  from the browser and got the expected response
   ![Screenshot (7)](https://github.com/Mathimohamed/cicd-demo-node/assets/151551076/9f34b652-d176-4c3e-b033-417aa4d04aea)











   # Dockerization: Dockerize the Node js application
   6. Dockerfile is used to create a docker container and consists of
    FROM node:16
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD [ "node", "server.js" ]
7.Userdata to setup and configure the docker
This script updates the system, installs Docker, starts the Docker service, adds the user to the Docker group, and adjusts permissions for Docker access. It's designed for an environment where Docker is being set up on an Amazon EC2 instance.
#!/bin/bash -xe

sudo su

sudo yum update
sudo yum install docker -y
sudp systemctl enable docker.service
sudo systemctl start docker.service
sudo systemctl status docker.service
sudo usermod -a -G docker ec2-user
sudo chmod 666 /var/run/docker.sock




