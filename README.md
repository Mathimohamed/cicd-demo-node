# CICD Devops
Basic directory structure
1. |----Dockerfile
2. |----server.js
4. |----.github-cicd.yml
5. |----node-modules
# Make the node application run locally using node server.js Tested the root  from the browser and got the expected response
![Screenshot (7)](https://github.com/Mathimohamed/cicd-demo-node/assets/151551076/9f34b652-d176-4c3e-b033-417aa4d04aea)











# Dockerization: Dockerize the Node js application
6.Dockerfile is used to create a docker container and consists of
  FROM node:16
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD [ "node", "server.js" ]
Used node 16 version and chose rc-slim in order to reduce the size of the docker images. This can help us deploy the docker image faster. Created a working directory as 
‘/node-docker’. Copied only node-modules because docker images are built layer by layer. Whenever the bottom layer gets changed, all the layers above them are rebuilt. So, 
application code changes often however, dependencies won't change much. Moreover, building the dependencies takes more time during the building process. Downloading and 
Installation of all the required dependencies is done using the command RUN npm install. The source code is copied to the container and “CMD [ "node","server.js"]”. 
"node" This is the executable or interpreter for the javascript programming language. It tells Docker to use node to execute the script and "node server.js" will be executed 
when the container starts. It is assumed to be in the current working directory or specified path within the container.

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
# CI/CD Implementation: Implement a Continuous Integration/Continuous Deployment (CI/CD) pipeline using Github Actions CI/CD.
name: CICD

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: [ubuntu-latest]
    steps:
      - name: Checkout source
        uses: actions/checkout@v3
      - name: Login to docker hub
        run: docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }} 
      - name: Build docker image
        run: docker build -t mathimohamed/pipeline-cicd .
      - name: Publish image to docker hub
        run: docker push mathimohamed/pipeline-cicd:latest
        
  deploy:
    needs: build
    runs-on: [aws-ec2]
    steps:
      - name: Pull image from docker hub
        run: docker pull mathimohamed/pipeline-cicd:latest
      - name: Delete old container
        run: docker rm -f pipeline-cicd-container
      - name: Run docker container
        run: docker run -d -p 3000:3000 --name pipeline-cicd-container mathimohamed/pipeline-cicd



