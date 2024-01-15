import { BigInt } from '@graphprotocol/graph-ts';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ZERO_BYTES_32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const MAX_TIMED_ROUND_WINNER_COUNT = 25;

export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);

// 60 * 60 * 24 * 7 * 4
export const BIGINT_4_WEEKS_IN_SECONDS = BigInt.fromI32(2419200);

// String enums are not yet supported by AssemblyScript
export namespace RoundEventState {
  export const CREATED = 'CREATED';
  export const FINALIZED = 'FINALIZED';
  export const CANCELLED = 'CANCELLED';
}

export namespace GovPowerStrategyType {
  export const VANILLA = 'VANILLA';
  export const ALLOWLIST = 'ALLOWLIST';
  export const BALANCE_OF = 'BALANCE_OF';
  export const BALANCE_OF_ERC20 = 'BALANCE_OF_ERC20';
  export const BALANCE_OF_ERC1155 = 'BALANCE_OF_ERC1155';
  export const CHECKPOINTABLE_ERC721 = 'CHECKPOINTABLE_ERC721';
  export const UNKNOWN = 'UNKNOWN';
}

export namespace RoundType {
  export const TIMED = 'TIMED';
  export const INFINITE = 'INFINITE';
}

export enum AssetType {
  NATIVE,
  ERC20,
  ERC721,
  ERC1155
}

export namespace AssetTypeString {
  export const NATIVE = 'NATIVE';
  export const ERC20 = 'ERC20';
  export const ERC721 = 'ERC721';
  export const ERC1155 = 'ERC1155';
}
