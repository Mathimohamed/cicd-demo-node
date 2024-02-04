# CICD Devops
Basic directory structure
1. |----Dockerfile
2. |----server.js
4. |----.github-cicd.yml
5. |----requirements.txt
CICD Devops Task XCEL

Architecture Diagram
  
  
    
  



Basic directory structure

 |---Terraform
 |----Dockerfile
 |----app.py
 |----.gitlab-ci.yml
 |----requirements.txt




requirements.txt  consists of


   

Make the flask application run locally using python app.py. Tested the root  from the browser and got the expected response



Dockerization: Dockerize the Python application

Dockerfile is used to create a docker container and consists of 


FROM python:3.13-rc-slim

WORKDIR /python-docker

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8081

CMD [ "python3","app.py"]


Used python 3.8 version and chose rc-slim in order to reduce the size of the docker images. This can help us deploy the docker image faster. Created a working directory as ‘/python-docker’. Copied only requirements.txt because docker images are built layer by layer. Whenever the bottom layer gets changed, all the layers above them are rebuilt. So, application code changes often however, dependencies won't change much. Moreover, building the dependencies takes more time during the building process. Downloading and Installation of all the required dependencies is done using the command pip3 install. The source code is copied to the container and “CMD [ "python3","app.py"]”. "python3" This is the executable or interpreter for the Python programming language. It tells Docker to use Python 3 to execute the script and "app.py" will be executed when the container starts. It is assumed to be in the current working directory or specified path within the container.

Provisioning the Ec2 Instance with terraform
In main.tf

Downloading Aws provider from the terraform module and
Specified the region we are provisioning
Provided the configuration of the ec2 Instance with userdata
Creating the Security groups with inboud rules 80 for HTTP, 22 for SSH, 8081 for Python
Userdata to setup and configure the docker
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




Initalizing by using

terraform init


Plan the changes that will be applied by this configuration

terraform plan


Apply the planned changes and create resources

terraform apply -auto-approve



CI/CD Implementation: Implement a Continuous Integration/Continuous Deployment (CI/CD) pipeline using Gitlab CI/CD.
CI/CD configuration automates the building and deployment of a Docker image. The image is built, tagged, and pushed to AWS ECR in the 'build' stage. In the 'deploy' stage, it connects to an EC2 instance, pulls the latest image, and runs a Docker container.

        image: docker:latest

        variables:
        REPOSITORY_URL: $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
        REGION: us-east-1
        DOCKER_HOST: tcp://docker:2375
        DOCKER_DRIVER: overlay2
        DOCKER_TLS_CERTDIR: ""
        IMAGE_TAG: $CI_PIPELINE_IID

        services:
        - docker:dind

        before_script:
        - apk add --no-cache curl jq python3 py3-pip
        - pip install awscli
        - aws ecr get-login-password --region "${REGION}"| docker login --username AWS --password-stdin $REPOSITORY_URL 

        stages:
        - build
        - deploy

        build:
        stage: build
        script:
        - echo "Building image..."
        - docker build -t $REPOSITORY_URL/$ECR_REPO:latest .
        - echo "Tagging image..."
        - docker tag $REPOSITORY_URL/$ECR_REPO:latest $REPOSITORY_URL/$ECR_REPO:$IMAGE_TAG
        - echo "Pushing image..."
        - docker push $REPOSITORY_URL/$ECR_REPO:latest
        - docker push $REPOSITORY_URL/$ECR_REPO:$IMAGE_TAG
        only:
        - main

        deploy:  
        stage: deploy

        before_script:
        - mkdir -p ~/.ssh
        - echo "$SSH_PRIVATE_KEY" | tr -d '\r' > ~/.ssh/id_rsa
        - chmod 600 ~/.ssh/id_rsa
        - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
        - eval "$(ssh-agent -s)"
        - ssh-add ~/.ssh/id_rsa

        script:
        - ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $EC2_USER@$EC2_INSTANCE_IP "docker stop demo-python || true && docker rm demo-python || true"
        - ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $EC2_USER@$EC2_INSTANCE_IP "aws ecr get-login-password --region "${REGION}"| docker login --username AWS --password-stdin $REPOSITORY_URL"
        - ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $EC2_USER@$EC2_INSTANCE_IP "docker pull $REPOSITORY_URL/$ECR_REPO:latest"
        - ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no $EC2_USER@$EC2_INSTANCE_IP "docker run -d -p 8081:8081 --name demo-python $REPOSITORY_URL/$ECR_REPO:latest"
        


Make sure to add the variables In Settings -> CICD -> Variables


Final Output


