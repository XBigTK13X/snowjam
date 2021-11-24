FROM node

EXPOSE 24072

COPY package.json package.json

COPY package-lock.json package-lock.json

RUN npm install

COPY server server

CMD npm run develop
