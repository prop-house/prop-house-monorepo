/**
 * Metadata for funding round. To be consumed on snapshot space and proposal creation.
 */
export interface PropHouseRoundMetadata {
  name: string;
  about: string;
  adminAddress?: string;
  strategy: PropHouseStrategyType;
  contractAddress?: string;
  customStrategy?: SnapshotStrategy;
  proposingStart: number;
  votingStart: number;
  votingEnd: number;
  snapshotBlock: number;
}

/**
 * Helper to abstract away strategy creation for most use cases.
 *
 * Having `PropHouseRoundMetadata` request a `SnapshotStrategy` object is unnecessary
 * in most cases. With `PropHouseStrategyType`, we abstract away the required fields
 * such that the SDK itself constructs the `SnapshotStrategy` if of type `ERC20` or `ERC721`.
 * In the case of custom strategies, `PropHouseRoundMetadata` requires the entire
 * `SnapshotStrategy` object.
 */
export enum PropHouseStrategyType {
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  Custom = 'custom',
}

/**
 * Minimal interface required by snapshot to kick off a space.
 * To be used as value for `snapshot` ENS text record.
 *
 * Example JSON blob: https://github.com/snapshot-labs/snapshot.js/blob/master/test/examples/space.json
 */
export interface SnapshotRoundMetadata {
  name: string;
  about: string;
  admins: string[];
  network: string; // string "1" for etherem
  strategies: SnapshotStrategy[];
  validation: SnapshotValidation;
}

/**
 * Interface required by snapshot to submit the strategy params
 */
export interface SnapshotStrategy {
  name: string;
  params: {};
}

/**
 * Strategy that returns the balances of the voters for a specific ERC20 token.
 *
 * Snapshot implementation: https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/erc20-balance-of
 */
export interface ERC20BalanceOfStrategy extends SnapshotStrategy {
  params: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Strategy that returns the balances of the voters for a specific ERC721 NFT.
 *
 * Snapshot implementation: https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/erc721
 */
export interface ERC721Strategy extends SnapshotStrategy {
  params: {
    address: string;
    symbol: string;
  };
}

export interface SnapshotValidation {
  name: string;
  params: {};
}

/**
 * Timeperiod validation sets timestamp requierements for proposals within a space
 *
 * Implementation: https://github.com/snapshot-labs/snapshot.js/tree/master/src/validations/timeperiod
 */
export interface TimeperiodValidation extends SnapshotValidation {
  params: {
    propEntryStart: number;
    propEntryEnd: number;
  };
}
