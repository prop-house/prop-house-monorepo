# @prophouse/sdk

[![NPM Version](https://img.shields.io/npm/v/@prophouse/sdk.svg?style=flat)](https://www.npmjs.com/package/@prophouse/sdk)

Useful tooling for interacting with the Prop House protocol

## Installation

```sh
npm install @prophouse/sdk
# OR
yarn add @prophouse/sdk
```

## Usage

### Entrypoint

The [PropHouse](src/prop-house.ts) class acts as the entrypoint for all chain queries and transactions. To create a prop house instance, provide the chain ID and a signer/provider:

```ts
import { ChainId, PropHouse } from '@prophouse/sdk';

const propHouse = new PropHouse({
  chainId: ChainId.EthereumGoerli,
  signerOrProvider: signer,
});
```

### House & Round Creation

A round can be created on new or existing house in a single transaction. The round can be fully funded, partially funded, or not funded at all at this time.

When funding a round, the `PropHouse` contract must be approved to spend included tokens prior to the transfer. If funding with ETH, no approval is necessary.

#### Create a round on a new house

```ts
import { AssetType, HouseType, RoundType, VotingStrategyType } from '@prophouse/sdk';

const response = await propHouse.createRoundOnNewHouse(
  {
    houseType: HouseType.COMMUNITY,
    config: {
      contractURI: 'ipfs://bafkreignr3s2dplrfey3yiob2es4fvkgnlo2k7vjuigwswibbwpldvr5wi',
    },
  },
  {
    roundType: RoundType.TIMED_FUNDING,
    title: 'Test Round',
    description: 'A round used for testing purposes',
    config: {
      // Offer 5 ETH split between 10 winners, funded later
      awards: [
        {
          assetType: AssetType.ETH,
          amount: ethers.utils.parseEther('5'),
        },
      ],
      // Voting power for this round is determined by a user's Noun balance
      strategies: [
        {
          strategyType: VotingStrategyType.BALANCE_OF,
          assetType: AssetType.ERC721,
          address: NOUNS_TOKEN,
        },
      ],
      proposalPeriodStartTimestamp: now + ONE_DAY_SEC,
      proposalPeriodDuration: ONE_DAY_SEC,
      votePeriodDuration: ONE_DAY_SEC,
      winnerCount: 10,
    },
  },
);
```

#### Create a round on an existing house

```ts
import { AssetType, RoundType, VotingStrategyType } from '@prophouse/sdk';

const response = await propHouse.createRoundOnExistingHouse(
  HOUSE_ADDRESS,
  {
    roundType: RoundType.TIMED_FUNDING,
    title: 'Test Round',
    description: 'A round used for testing purposes',
    config: {
      // Offer 5 ETH split between 10 winners, funded later
      awards: [
        {
          assetType: AssetType.ETH,
          amount: ethers.utils.parseEther('5'),
        },
      ],
      // Voting power for this round is determined by a user's Noun balance
      strategies: [
        {
          strategyType: VotingStrategyType.BALANCE_OF,
          assetType: AssetType.ERC721,
          address: NOUNS_TOKEN,
        },
      ],
      proposalPeriodStartTimestamp: now + ONE_DAY_SEC,
      proposalPeriodDuration: ONE_DAY_SEC,
      votePeriodDuration: ONE_DAY_SEC,
      winnerCount: 10,
    },
  },
);
```

#### Create and fund a round on a new house

```ts
import { Asset, AssetType, HouseType, RoundType, VotingStrategyType } from '@prophouse/sdk';

// Offer 5 ETH split between 10 winners
const assets: Asset[] = [
  {
    assetType: AssetType.ETH,
    amount: ethers.utils.parseEther('5'),
  },
];

const response = await propHouse.createAndFundRoundOnNewHouse(
  {
    houseType: HouseType.COMMUNITY,
    config: {
      contractURI: 'ipfs://bafkreignr3s2dplrfey3yiob2es4fvkgnlo2k7vjuigwswibbwpldvr5wi',
    },
  },
  {
    roundType: RoundType.TIMED_FUNDING,
    title: 'Test Round',
    description: 'A round used for testing purposes',
    config: {
      awards: assets,
      // Voting power for this round is determined by a user's Noun balance
      strategies: [
        {
          strategyType: VotingStrategyType.BALANCE_OF,
          assetType: AssetType.ERC721,
          address: NOUNS_TOKEN,
        },
      ],
      proposalPeriodStartTimestamp: now + ONE_DAY_SEC,
      proposalPeriodDuration: ONE_DAY_SEC,
      votePeriodDuration: ONE_DAY_SEC,
      winnerCount: 10,
    },
  },
  assets, // This example funds the round in full, but any amount is acceptable
);
```

#### Create and fund a round on an existing house

```ts
import { Asset, AssetType, RoundType, VotingStrategyType } from '@prophouse/sdk';

// Offer 5 ETH split between 10 winners
const assets: Asset[] = [
  {
    assetType: AssetType.ETH,
    amount: ethers.utils.parseEther('5'),
  },
];

const response = await propHouse.createAndFundRoundOnExistingHouse(
  HOUSE_ADDRESS,
  {
    roundType: RoundType.TIMED_FUNDING,
    title: 'Test Round',
    description: 'A round used for testing purposes',
    config: {
      awards: assets,
      // Voting power for this round is determined by a user's Noun balance
      strategies: [
        {
          strategyType: VotingStrategyType.BALANCE_OF,
          assetType: AssetType.ERC721,
          address: NOUNS_TOKEN,
        },
      ],
      proposalPeriodStartTimestamp: now + ONE_DAY_SEC,
      proposalPeriodDuration: ONE_DAY_SEC,
      votePeriodDuration: ONE_DAY_SEC,
      winnerCount: 10,
    },
  },
  assets,
);
```

#### Deposit an asset to a round

```ts
import { AssetType } from '@prophouse/sdk';

// ETH
await propHouse.depositTo(ROUND_ADDRESS, {
  assetType: AssetType.ETH,
  amount: ethers.utils.parseEther('1'),
});

// ERC20
await propHouse.depositTo(ROUND_ADDRESS, {
  assetType: AssetType.ERC20,
  address: ERC20_TOKEN_ADDRESS,
  amount: ERC20_TOKEN_AMOUNT,
});

// ERC721
await propHouse.depositTo(ROUND_ADDRESS, {
  assetType: AssetType.ERC721,
  address: ERC721_TOKEN_ADDRESS,
  tokenId: ERC721_TOKEN_ID,
});

// ERC1155
await propHouse.depositTo(ROUND_ADDRESS, {
  assetType: AssetType.ERC1155,
  address: ERC1155_TOKEN_ADDRESS,
  amount: ERC1155_TOKEN_AMOUNT,
  tokenId: ERC1155_TOKEN_ID,
});
```

#### Deposit many assets to a round

```ts
await propHouse.batchDepositTo(ROUND_ADDRESS, [
  {
    assetType: AssetType.ETH,
    amount: ethers.utils.parseEther('1'),
  },
  {
    assetType: AssetType.ERC20,
    address: ERC20_TOKEN_ADDRESS,
    amount: ERC20_TOKEN_AMOUNT,
  },
  {
    assetType: AssetType.ERC721,
    address: ERC721_TOKEN_ADDRESS,
    tokenId: ERC721_TOKEN_ID,
  },
  {
    assetType: AssetType.ERC1155,
    address: ERC1155_TOKEN_ADDRESS,
    amount: ERC1155_TOKEN_AMOUNT,
    tokenId: ERC1155_TOKEN_ID,
  },
]);
```
