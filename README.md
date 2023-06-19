<div align="center">
  <p align="center">
    <a href="https://prop.house/" target="blank"><img src="https://i.imgur.com/tPLjLwA.png" width="200" alt="Prop House Logo" /></a>
  </p>
  <h1>Prop House</h1>
  <p>A public infrastructure project by <a href="https://nouns.wtf/" target="blank">Nouns DAO</a></p>

  <a href="./packages/prop-house-protocol">Protocol</a>
  &nbsp;&nbsp;&nbsp;
  <a href="./packages/prop-house-sdk">SDK</a>
</div>

## About

Prop House offers a novel mechanism for communities to deploy capital within their ecosystems: asset auctions where the bids placed are proposals. At the end of each auction, members of corresponding communities vote on which proposals get funded. Learn more by reading the [FAQs](https://prop.house/faq) or joining the [Discord](https://discord.gg/SKPzM8GHts).

## Packages

### @prophouse/backend

The [Prop House backend](./packages/prop-house-backend) is implemented using Nestjs and handles CRUD actions for storing prop house data. It provides a [GraphQL interface](https://prod.backend.prop.house/graphql) for querying data.

### @prophouse/wrapper

The [Prop House wrapper](./packages/prop-house-wrapper) is a convenience class that wraps the HTTP interaction with a prop house backend and performs the signing of payloads. It also provides types for the response and input objects. The package also includes examples for creating proposals, uploading files, and voting.

### @prophouse/webapp

The [Prop House webapp](./packages/prop-house-webapp) is the frontend for interacting with houses as hosted at [prop.house](https://prop.house).

### @prophouse/communities

The [Prop House communities](./packages/prop-house-communities) package contains the logic to fetch voting data for individuals within the scope of their own communities.

### @prophouse/protocol

The [Prop House protocol](./packages/prop-house-protocol) package contains the Solidity and Cairo contracts that power the Prop House protocol.

### @prophouse/sdk

The [Prop House SDK](./prop-house-sdk) package contains utilities that simplify interaction with the Prop House protocol.

## Quick Start

From the monorepo root:

### Install dependencies

```
yarn
```

### Build packages

```
yarn build
```

### Start up backend

```sh
# switch to prop-house-backend
cd packages/prop-house-backend
# start up containers
docker-compose up -d
## Run migrations
yarn migration:run
# Copy example environment file
cp .env.example .env
# build and run
yarn start:dev
```

### Start up frontend

```sh
# switch to prop-house-webapp
cd packages/prop-house-webapp
# Copy example environment file
cp .env.example .env
# Start local development
yarn start
```
