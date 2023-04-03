## Description

The `prop-house-community` package manages the voting strategies for Prop House communities.

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
import { getVotingPower } from 'prop-house-communities';

const votes = await getVotingPower(address, communityAddress, provider, blockTag);
```

## Strategies

Strategies can be found in the `strategies/` directory. A strategy is a function that returns a function of `Strategy` type. Put another way, custom strategies are functions that return the implementation of the base `Strategy` type.

```.ts
// base Strategy type
export type Strategy = (
  userAddress: string,
  communityAddress: string,
  blockTag: number,
  provider: Provider,
) => Promise<number>;

// example strategy
export const myCustomStrategy = (optionalParams: string): Strategy => {
  return async (
    userAddress: string
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    // my custom implementation
    return numVotesForAddress
    };
};
```

### Considerations:

- Strategies may add additional parameters particular to the community (optional)
- Strategies may use the ethers.js `Provider` to make calls on-chain
- Strategies must return a `Promise<number>` denoting the number of votes the `userAddress` has for `communityAddress` at snapshot block `blockTag`.

### Example

The `balanceOfErc20` strategy requires two additional parameters (`decimals` and `multiplier`). It uses said parameters to implement and return a function of `Strategy` type.

```.ts
export const balanceOfErc20 = (decimals: number, multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOfABI, provider);
    const balance = await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) });
    return new BigNumber(formatUnits(balance, decimals).toString()).times(multiplier).toNumber();
  };
};
```
