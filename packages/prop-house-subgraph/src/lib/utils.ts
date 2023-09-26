import { Address, BigInt, ByteArray, crypto, ethereum } from '@graphprotocol/graph-ts';
import { AssetType, AssetTypeString, BIGINT_ONE, GovPowerStrategyType } from './constants';
import { poseidonHashMany } from 'as-poseidon';

// Common asset struct
export class AssetStruct extends ethereum.Tuple {
  get assetType(): i32 {
    return this[0].toI32();
  }

  get token(): Address {
    return this[1].toAddress();
  }

  get identifier(): BigInt {
    return this[2].toBigInt();
  }

  get amount(): BigInt {
    return this[3].toBigInt();
  }
}

/**
 * Convert the flattened voting strategy params to a 2D-array
 * @param votingStrategyParamsFlat The flattened voting strategy param array
 */
export function get2DArray(votingStrategyParamsFlat: BigInt[]): BigInt[][] {
  const array2D: BigInt[][] = [];

  const numArrays = votingStrategyParamsFlat[0];
  if (numArrays.toI32() == 1) {
    array2D.push(votingStrategyParamsFlat.slice(2));
    return array2D;
  }
  
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

/**
 * Pad the provided string to 32 bytes
 * @param s The string to pad
 */
export function padBytes32(s: string): string {
  return s.padStart(64, '0');
}

/**
 * Compute a governance power strategy ID
 * @param strategy The governance power strategy address
 * @param params The governance power strategy params
 */
export function computeGovPowerStrategyID(strategy: BigInt, params: BigInt[]): string {
  return BigInt.fromString(poseidonHashMany([strategy.toString()].concat(params.map<string>((p: BigInt) => p.toString())))).toHexString();
}

/**
 * Compute an asset ID
 * @param asset The asset information
 */
export function computeAssetID(asset: AssetStruct): string {
  if (asset.assetType == AssetType.NATIVE) {
    return padBytes32(asset.assetType.toString(16));
  }
  if (asset.assetType == AssetType.ERC20) {
    return padBytes32(`${asset.assetType.toString(16)}${asset.token.toHex()}`);
  }
  return `${asset.assetType}${crypto.keccak256(ByteArray.fromHexString
    (`${asset.token.toHex()}${asset.identifier.toHex()}`
  ))}`.slice(0, 32);
}

/**
 * Get an asset type string
 * @param assetType The numeric asset type
 */
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

/**
 * Get the governance power strategy type
 * @param addr The governance power strategy address
 */
export function getGovPowerStrategyType(addr: string): string {
  if (addr == '0x77b9d96e71380b1cba3cdc6450c103c9806c7c17611fc5ac9b57943cb919cbd') {
    return GovPowerStrategyType.BALANCE_OF;
  }
  if (addr == '0x37bebb719da8869531a12be866732dbaa6e840f507b94b30e0e438ac560b1a') {
    return GovPowerStrategyType.ALLOWLIST;
  }
  if (addr == '0x23a5d2474eb348d62d9da78c9383abfe557e7b95999edc6b261bae81bf3a769') {
    return GovPowerStrategyType.VANILLA;
  }
  return GovPowerStrategyType.UNKNOWN;
}
