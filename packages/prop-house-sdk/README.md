# @prophouse/sdk

[![NPM Version](https://img.shields.io/npm/v/@prophouse/sdk.svg?style=flat)](https://www.npmjs.com/package/@prophouse/sdk)

Useful tools for interacting with the Prop House protocol

## Installation

```sh
npm install @prophouse/sdk
# OR
yarn add @prophouse/sdk
```

## Usage

### Entrypoint
---

The [PropHouse](src/prop-house.ts) class acts as the entrypoint for all Prop House protocol interactions.

#### Features

- [House and round creation](#house--round-creation)
- [Round asset depositing](#round-asset-deposits)
- [Querying of house and round state](#house--round-queries)
- Proposal and vote submission

To create a prop house instance, provide the chain ID and a signer/provider:

```ts
import { ChainId, PropHouse } from '@prophouse/sdk';

const propHouse = new PropHouse({
  evmChainId: ChainId.EthereumGoerli,
  evm: signer, // Alternatively, pass a provider
});
```

### House & Round Creation
---

A round can be created on new or existing house in a single transaction. The round can be fully funded, partially funded, or not funded at all at this time.

When funding a round, the `PropHouse` contract must be approved to spend included tokens prior to the transfer. If funding with ETH, no approval is necessary.

#### Examples

<details>
  <summary>Create a round on a new house</summary>

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
        proposalPeriodStartUnixTimestamp: now + ONE_DAY_SEC,
        proposalPeriodDurationSecs: ONE_DAY_SEC,
        votePeriodDurationSecs: ONE_DAY_SEC,
        winnerCount: 10,
      },
    },
  );
  ```
</details>

<details>
  <summary>Create a round on an existing house</summary>

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
        proposalPeriodStartUnixTimestamp: now + ONE_DAY_SEC,
        proposalPeriodDurationSecs: ONE_DAY_SEC,
        votePeriodDurationSecs: ONE_DAY_SEC,
        winnerCount: 10,
      },
    },
  );
  ```
</details>

<details>
  <summary>Create and fund a round on a new house</summary>

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
        proposalPeriodStartUnixTimestamp: now + ONE_DAY_SEC,
        proposalPeriodDurationSecs: ONE_DAY_SEC,
        votePeriodDurationSecs: ONE_DAY_SEC,
        winnerCount: 10,
      },
    },
    assets, // This example funds the round in full, but any amount is acceptable
  );
  ```
</details>

<details>
  <summary>Create and fund a round on an existing house</summary>

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
        proposalPeriodStartUnixTimestamp: now + ONE_DAY_SEC,
        proposalPeriodDurationSecs: ONE_DAY_SEC,
        votePeriodDurationSecs: ONE_DAY_SEC,
        winnerCount: 10,
      },
    },
    assets,
  );
  ```
</details>

### Round Asset Deposits
---

If a round is not fully funded during creation, it can be funded by **anyone** at any time. This is useful when multiple parties are funding a round, or when a round is funded by someone other than the round creator, such as a DAO.

Upon deposit, a receipt is issued to the depositor. This receipt can be used to reclaim assets while the round is awaiting registration, or in the event of a round cancellation. Receipts are transferrable.

#### Examples

<details>
  <summary>Deposit an asset to a round</summary>

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
</details>

<details>
  <summary>Deposit many assets to a round</summary>

  ```ts
  import { AssetType } from '@prophouse/sdk';

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
</details>

### House & Round Queries
---

A `query` property is exposed on the `PropHouse` instance, which exposes a variety of methods for querying house and round state.

Alternatively, the `QueryWrapper` class can be instantiated on its own:

```ts
import { ChainId, QueryWrapper } from '@prophouse/sdk';

const query = new QueryWrapper(ChainId.EthereumGoerli);
```

#### Methods

* **getHouses**: Get high-level house information for many houses. Accepts an optional pagination and ordering configuration.
* **getHousesWhereAccountHasCreatorPermissions**: Get paginated houses where the provided account has creator permissions. Accepts the account address, and an optional pagination and ordering configuration.
* **getHousesWhereAccountIsOwner**: Get paginated houses where the provided account is the house owner. Accepts the account address, and an optional pagination and ordering configuration.
* **getHousesWhereAccountIsOwnerOrHasCreatorPermissions**: Get paginated houses where the provided account is the house owner or has creator permissions. Accepts the account address, and an optional pagination and ordering configuration.
* **getRounds**: Get high-level round information for many rounds. Accepts an optional pagination and ordering configuration.
* **getRoundsForHouse**: Get high-level round information for many rounds on the provided house. Accepts the house address, and an optional pagination and ordering configuration.
* **getRoundsWhereTitleContains**: Get high-level round information for many rounds where the title contains the provided partial title text. Accepts the partial title text, and an optional pagination and ordering configuration.
* **getRound**: Get detailed information for a single round. Accepts the round address.
* **getRoundWithHouseInfo**: Get detailed information for a single round, including house information. Accepts the round address.
* **getRoundBalances**: Get balance information for a single round. Accepts the round address, and an optional pagination and ordering configuration.
* **getRoundVotingStrategies**: Get voting strategy information for a single round. Accepts the round address, and an optional pagination and ordering configuration.
* **getRoundsManagedByAccount**: Get paginated rounds currently managed by the provided account address. Accepts the account address, and an optional pagination and ordering configuration.
* **getRoundDepositsByAccount**: Get paginated round deposits by the provided account address. Accepts the depositor address, and an optional pagination and ordering configuration.
* **getRoundClaimsByAccount**: Get paginated round claims by the provided account address. Accepts the claimer address, and an optional pagination and ordering configuration.
* **getProposalsByAccount**: Get paginated proposals by the provided account address. Accepts the account address, and an optional pagination and ordering configuration.
* **getVotesByAccount**: Get paginated votes by the provided account address. Accepts the account address, and an optional pagination and ordering configuration.
* **getProposalsForRound**: Get paginated proposals for the provided round address. Accepts the round address, and an optional pagination and ordering configuration.

In addition, you make custom queries using the underlying `EVM` and `Starknet` GraphQL clients:

```ts
// EVM
const { houses } = await propHouse.query.gql.evm.request(`
  {
    houses {
      id
    }
  }
`);

// Starknet
const { proposals } = await propHouse.query.gql.starknet.request(`
  {
    proposals {
      id
    }
  }
`);
```
