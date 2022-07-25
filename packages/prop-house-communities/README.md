## Description

The prop house community package handles the fetching of votes allotted to individual addresses within communities.

The default method queries `balanceOf` from the community's ERC721 contract. Some communities have alternative methods for alloting votes which requires custom logic (e.g. delegation).

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

const votes = await getNumVotes(address, communityAddress, provider);
```
