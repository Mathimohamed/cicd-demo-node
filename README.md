# CICD Devops Task

Basic directory structure

 
 |----Dockerfile
 |----server.js
 |----.github-cicd.yml
 |----node-modules

Make the flask application run locally using node server.js Tested the root  from the browser and got the expected response



# Dockerization: Dockerize the Python application

Dockerfile is used to create a docker container and consists of 


FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]


Used node 16 version and chose rc-slim in order to reduce the size of the docker images. This can help us deploy the docker image faster. Created a working directory as ‘/node-docker’. Copied only package.json because docker images are built layer by layer. Whenever the bottom layer gets changed, all the layers above them are rebuilt. So, application code changes often however, dependencies won't change much. Moreover, building the dependencies takes more time during the building process. Downloading and Installation of all the required dependencies is done using the command npm install. The source code is copied to the container and “CMD [ "node", "server.js" ]”. "node:16" This is the executable or interpreter for the Python programming language. It tells Docker to use node 16 to execute the script and "seever.js" will be executed when the container starts. It is assumed to be in the current working directory or specified path within the container.



# CI/CD Implementation: Implement a Continuous Integration/Continuous Deployment (CI/CD) pipeline using Gitlab CI/CD.
# CI/CD configuration automates the building and deployment of a Docker image. The image is built, tagged, and pushed to AWS ECR in the 'build' stage. In the 'deploy' stage, it connects to an EC2 instance, pulls the latest image, and runs a Docker container.

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
