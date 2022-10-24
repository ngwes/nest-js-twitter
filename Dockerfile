FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN chmod +x ./wait-for-it.sh ./docker-entrypoint.sh
RUN npm run build

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD [ "npm","run", "start:prod" ]