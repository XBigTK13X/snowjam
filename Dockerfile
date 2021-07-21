FROM node

EXPOSE 24072

COPY package.json package.json

COPY yarn.lock yarn.lock

RUN yarn install

COPY server server

CMD yarn develop
