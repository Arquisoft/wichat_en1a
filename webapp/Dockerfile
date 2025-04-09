FROM node:22

COPY . /app
WORKDIR /app

#Install the dependencies
RUN npm install --omit=dev

ARG API_URI="http://localhost:8000"
ENV REACT_APP_API_ENDPOINT=$API_URI
RUN echo "Building with REACT_APP_API_ENDPOINT=$REACT_APP_API_ENDPOINT" > /build.log

#Create an optimized version of the webapp
RUN npm run build
RUN npm install serve

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]
