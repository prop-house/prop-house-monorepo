FROM node:16

ADD package.json .
ADD yarn.lock .

RUN yarn

ADD . .

RUN yarn build

CMD [ "node", "dist/main.js" ]
