// String enums are not yet supported by AssemblyScript

export namespace HouseType {
  export const FUNDING = 'FUNDING';
}

export namespace RoundType {
  export const TIMED_FUNDING = 'TIMED_FUNDING';
}

export namespace RoundState {
  export const AWAITING_REGISTRATION = 'AWAITING_REGISTRATION';
  export const REGISTERED = 'REGISTERED';
  export const FINALIZED = 'FINALIZED';
  export const CANCELLED = 'CANCELLED';
}

export namespace VotingStrategyType {
  export const BALANCE_OF = 'BALANCE_OF';
  export const WHITELIST = 'WHITELIST';
  export const VANILLA = 'VANILLA';
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