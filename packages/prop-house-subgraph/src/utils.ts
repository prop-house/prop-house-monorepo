import { RoundRegisteredAwardsStruct } from '../generated/templates/TimedFundingRound/TimedFundingRound';
import { Address, BigInt, ByteArray, crypto } from '@graphprotocol/graph-ts';
import { AssetTypeString, AssetType } from './types';
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
