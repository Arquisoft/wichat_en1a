# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/gatewayservice

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

ARG LLM_API_KEY
ENV LLM_API_KEY=$LLM_API_KEY

# Copy the app source code to the working directory
COPY . .

# Define the command to run your app
CMD ["node", "gateway-service.js"]
