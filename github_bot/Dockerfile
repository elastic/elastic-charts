FROM node:16-alpine as builder
WORKDIR /app
COPY firebase.json .firebaserc ./
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.main.json ./tsconfig.json
COPY src src
RUN yarn build

FROM node:16-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY firebase.json .firebaserc ./
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --from=builder /app/build ./build
ENTRYPOINT [ "node" ]
CMD [ "./build" ]
