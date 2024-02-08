import { Address, BigInt, ByteArray, crypto, ethereum } from '@graphprotocol/graph-ts';
import { AssetType, AssetTypeString, GovPowerStrategyType, ZERO_BYTES_32 } from './constants';
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
  const numArrays = votingStrategyParamsFlat[0].toI32();

  // Extract the offsets from the flat array
  const offsets = votingStrategyParamsFlat.slice(1, 1 + numArrays);

  // For each offset, extract the corresponding sub-array
  for (let i = 0; i < numArrays; i++) {
    const start = offsets[i].toI32();
    const end = (i === numArrays - 1) ? votingStrategyParamsFlat.length : votingStrategyParamsFlat[i + 2].toI32();
    array2D.push(votingStrategyParamsFlat.slice(start + numArrays + 1, end + numArrays + 1));
  }
  return array2D;
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
  switch (asset.assetType) {
    case AssetType.NATIVE:
      return ZERO_BYTES_32;
    case AssetType.ERC20:
      return `0x0${asset.assetType.toString(16)}${asset.token.toHex().substring(2)}`.padEnd(66, '0');
    default:
      const token = asset.token.toHex().substring(2);
      const paddedIdentifier = asset.identifier.toHex().substring(2).padStart(64, '0');
      const keccakHash = crypto.keccak256(ByteArray.fromHexString(`${token}${paddedIdentifier}`)).toHex().substring(2);

      return `0x0${asset.assetType.toString(16)}${keccakHash}`.slice(0, 66);
  }
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
  if (addr == '0x6ddcc94a4225843546a9b118a2733fd924d6b8a6467279cbe6a1aea79daca54') {
    return GovPowerStrategyType.BALANCE_OF;
  }
  if (addr == '0x196cf5ceba8e98abe1e633d6184cd28c1e1ebd09ea71f89867dd4c5fda97bbe') {
    return GovPowerStrategyType.BALANCE_OF_ERC20;
  }
  if (addr == '0x6d22f17522d6992eb479deb850e96f9454fc2f6c127993ab2ef9d411f467e8' || addr == '0x44e3bdffcb6ce36596d0faa4316932c5dc47005b9eaaf0f7ce0f455c98b2e75') {
    return GovPowerStrategyType.BALANCE_OF_ERC1155;
  }
  if (addr == '0x10f7529ec5df9069a06191deb7cd2c4158c2b59879e2544cb45dc221daff429') {
    return GovPowerStrategyType.CHECKPOINTABLE_ERC721;
  }
  if (addr == '0x3daa40ef909961a576f9ba58eb063d5ebc85411063a8b29435f05af6167079c') {
    return GovPowerStrategyType.ALLOWLIST;
  }
  return GovPowerStrategyType.UNKNOWN;
}

/**
 * Pad a hex string to 32 bytes
 * @param hex The hex string to pad
 */
export function padHexTo32Bytes(hex: string): string {
  return `0x${hex.substring(2).padStart(64, '0')}`;
}
