FROM node:13-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY . .

EXPOSE 8081

# Development
CMD ["npm", "run", "start"]