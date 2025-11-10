# Args
ARG NODE_ENV=development
ARG WORKING_DIR=app

# Image
FROM node:16.4.2-alpine


# Install PM2 and pnpm
RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

# Specifying our working dir if doesnot exist then create
WORKDIR /${WORKING_DIR}

# Add package.json and package.lock to container.
ADD package*.json .npmrc pnpm-lock.yaml ./

# install dependiencies in the docker container.
RUN pnpm install --frozen-lockfile --prod

# copy all our source code to docker container.
ADD ./ ./

# exposes 4000 to main os. uncomment this for docker build and optional for docker comopose
# EXPOSE 8181

# execute npm start to run our application.
CMD ["npm","start"]




# NOTE

# Local:Container

# sudo docker build -t node-dms .             => -t stands for tags
# sudo docker run -it --env-file .env node-dms      => -it run in interactive mode, -d run in detach mode i.e. background mode.



# Dockerfile is an blueprint to create image
# image is Object to create instance called container
# Container is running app.


# DOCKER NETWORK
# bridge - default network | can communicate with conatiners with same docker network.
# host - can communtiate with host network | is on host network
# null - cannot communitate with host nor conatainer

# Docker-compose
# Tool for running multiple docker container at same time.
