## Description

The prop house community package manages the voting strategies for communities.

The default strategy relies on querying `balanceOf` from the community's ERC721/20 contract. Some communities need custom strategies that accomodate to their particular needs (e.g. delegation, sum of balances across multiple contracts, etc). Custom strategies can be found in the `strategies/` dir.

## Development

### Install dependencies

```
yarn
```

### Build

```
yarn build
```

## Usage

```ts
import { getNumVotes } from 'prop-house-communities';

const votes = await getNumVotes(address, communityAddress, provider, blockTag);
```
