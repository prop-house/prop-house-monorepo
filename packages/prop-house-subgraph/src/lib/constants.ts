import { BigInt } from '@graphprotocol/graph-ts';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);

// 60 * 60 * 24 * 7 * 8
export const BIGINT_8_WEEKS_IN_SECONDS = BigInt.fromI32(4838400);

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
  export const BALANCE_OF_ERC1155 = 'BALANCE_OF_ERC1155';
  export const UNKNOWN = 'UNKNOWN';
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
