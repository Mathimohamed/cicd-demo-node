# CICD Devops Task


Basic directory structure
- Dockerfile
- server.js
- .github-cicd.yml
- node-modules

Make the flask application run locally using node server.js Tested the root  from the browser and got the expected response

![Screenshot (7)](https://github.com/Mathimohamed/cicd-demo-node/assets/151551076/9f34b652-d176-4c3e-b033-417aa4d04aea)



# Dockerization: Dockerize the nodejs application

Dockerfile is used to create a docker container and consists of 


1. FROM node:16

2. WORKDIR /usr/src/app

3. COPY package*.json ./
4. RUN npm install

5. COPY . .

6. EXPOSE 3000

7. CMD [ "node", "server.js" ]


Used node 16 version and chose rc-slim in order to reduce the size of the docker images. This can help us deploy the docker image faster. Created a working directory as ‘/node-docker’. Copied only package.json because docker images are built layer by layer. Whenever the bottom layer gets changed, all the layers above them are rebuilt. So, application code changes often however, dependencies won't change much. Moreover, building the dependencies takes more time during the building process. Downloading and Installation of all the required dependencies is done using the command npm install. The source code is copied to the container and “CMD [ "node", "server.js" ]”. "node:16" This is the executable or interpreter for the Python programming language. It tells Docker to use node 16 to execute the script and "seever.js" will be executed when the container starts. It is assumed to be in the current working directory or specified path within the container.



# CI/CD Implementation: Implement a Continuous Integration/Continuous Deployment (CI/CD) pipeline using Github action CI/CD.

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
        

        
