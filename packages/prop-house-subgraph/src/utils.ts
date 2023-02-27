import { RoundRegisteredAwardsStruct } from '../generated/templates/TimedFundingRound/TimedFundingRound';
import { AssetTypeString, AssetType, HouseType, RoundType, VotingStrategyType } from './types';
import { BigInt, ByteArray, crypto } from '@graphprotocol/graph-ts';
import { computeHashOnElements } from 'as-pedersen';
import { BIGINT_ONE } from './constants';

export function get2DArray(votingStrategyParamsFlat: BigInt[]): BigInt[][] {
  const array2D: BigInt[][] = [];

  const numArrays = votingStrategyParamsFlat[0];
  for (let i = 0; i < numArrays.toI32(); i++) {
    const start = votingStrategyParamsFlat[i + 1];
    const end = votingStrategyParamsFlat[i + 2];
    array2D.push(votingStrategyParamsFlat.slice(
      start.plus(numArrays).plus(BIGINT_ONE).toU32(),
      end.plus(numArrays).plus(BIGINT_ONE).toU32()),
    );
  }
  return array2D;
}

export function computeVotingStrategyID(strategy: BigInt, params: BigInt[]): string {
  return computeHashOnElements([strategy.toString()].concat(params.map<string>((p: BigInt) => p.toString())));
}

export function toBytes32(s: string): string {
  return s.padStart(64, '0');
}

export function computeAssetID(asset: RoundRegisteredAwardsStruct): string {
  if (asset.assetType === AssetType.NATIVE) {
    return toBytes32(asset.assetType.toString(16));
  }
  if (asset.assetType == AssetType.ERC20) {
    return toBytes32(`${asset.assetType.toString(16)}${asset.token.toHex()}`);
  }
  return `${asset.assetType}${crypto.keccak256(ByteArray.fromHexString
    (`${asset.token.toHex()}${asset.identifier.toHex()}`
  ))}`.slice(0, 32);
}

export function getAssetTypeString(assetType: AssetType): string {
  switch (assetType) {
    case AssetType.NATIVE:
      return AssetTypeString.NATIVE;
    case AssetType.ERC20:
      return AssetTypeString.ERC20;
    case AssetType.ERC721:
      return AssetTypeString.ERC721;
    case AssetType.ERC1155:
      return AssetTypeString.ERC1155;
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}

export function getHouseType(impl: string): string {
  if (impl === '0xb4d5696D3E58F6A55e360d5D1Bd568aC1c992Ed0') {
    return HouseType.COMMUNITY;
  }
  throw new Error(`Unknown house implementation: ${impl}`);
}

export function getRoundType(impl: string): string {
  if (impl === '0xd687A6708bb5A8A025e25DD4BE1e3Af33eB8fa0d') {
    return RoundType.TIMED_FUNDING;
  }
  throw new Error(`Unknown round implementation: ${impl}`);
}

export function getVotingStrategyType(addr: string): string {
  if (addr === '0x4e2138a3d375454938f25316e13f6dee5a3d6ce977ef8768b04e52d98b4d3cb') {
    return VotingStrategyType.BALANCE_OF;
  }
  if (addr === '0x60d2e252c13d76dee13a8567633f59ef497c02992f7a7c4eb4fe323eb22355d') {
    return VotingStrategyType.BALANCE_OF_WITH_MULTIPLIER;
  }
  if (addr === '0x6ff2c5160e8644bc256c8d0260a93f86baf2da481cdfaa0ff1d5db2e143d3a6') {
    return VotingStrategyType.WHITELIST;
  }
  if (addr === '0x5284369b5a72d628c20607e438351d8f1b20f26683e710ed68f3ebfb7b277ab') {
    return VotingStrategyType.VANILLA;
  }
  return VotingStrategyType.UNKNOWN;
}
