## Prop House

Nouns Proposal Auction House (or Prop House) is an experimental approach to deploying capital: an auction of ETH where the bids placed are proxy NounsDAO proposals. At the end of each auction, Noun owners (Nouners) vote on which proposal gets funded.

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

## Packages

### prop-house-backend

The prop house backend is implemented using Nestjs and will handle the CRUD actions for storing prop house data. It currently requires every message to the API to be signed by an Ethereum address for attribution purposes and this will morph into permissions and rate limiting as well.

### @nouns/prop-house-wrapper

This convenience class wraps the HTTP interaction with a prop house backend and performs the signing of payloads. It also provides types for the response and input objects. The package also includes examples for creating proposals, uploading files, and voting.

### prop-house-webapp

The prop house webapp is the frontend for interacting with houses as hosted at [prop.house](https://prop.house).

### prop-house-communities

This package contains the logic to fetch voting data for individuals within the scope of their own communities.
