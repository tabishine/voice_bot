FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install
EXPOSE 9080
CMD [ "node", "build/src/main.js" ]