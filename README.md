## Prop House

Nouns Proposal Auction House (or Prop House) is an experimental approach to deploying capital: an auction of ETH where the bids placed are proxy NounsDAO proposals. At the end of each auction, Noun owners (Nouners) vote on which proposal gets funded.

## Quick Start

From the monorepo root:

```
yarn
cd packages/prop-house-wrapper
yarn build
cd packages/prop-house-communities
yarn build
cd ../prop-house-backend
docker-compose up -d
# In packages/prop-house-backend
yarn start:dev
# In packages/prop-house-webapp
yarn start
```

## Packages

### prop-house-backend

The prop house backend is implemented using Nestjs and will handle the CRUD actions for storing prop house data. It currently requires every message to the API to be signed by an Ethereum address for attribution purposes and this will morph into permissions and rate limiting as well.

### prop-house-wrapper

This convenience class wraps the HTTP interaction with a prop house backend and performs the signing of payloads. It also provides types for the response and input objects. The package also includes examples for creating proposals, uploading files, and voting.

### prop-house-webapp

This PR migrates the path of the prop house webapp, also adds a redux state store for application data, and implements creating a proposal from the editor.
