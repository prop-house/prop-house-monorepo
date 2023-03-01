import { Address, BigInt, ByteArray, crypto, ethereum } from '@graphprotocol/graph-ts';
import { AssetType, AssetTypeString, BIGINT_ONE, VotingStrategyType } from './constants';
import { computeHashOnElements } from 'as-pedersen';

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
 * Compute a voting strategy ID
 * @param strategy The voting strategy address
 * @param params The voting strategy params
 */
export function computeVotingStrategyID(strategy: BigInt, params: BigInt[]): string {
  return computeHashOnElements([strategy.toString()].concat(params.map<string>((p: BigInt) => p.toString())));
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
 * Get the voting strategy type
 * @param addr The voting strategy address
 */
export function getVotingStrategyType(addr: string): string {
  if (addr == '0x7d76f45aa273bcf33fa19139a2ee8f87436cd5fc3c0c91129dd2e2aad27dc9c') {
    return VotingStrategyType.BALANCE_OF;
  }
  if (addr == '0x16e2c060a1d6f6754b7e13f8c050da7b27719df10a91c57caba72fde93c1c0d') {
    return VotingStrategyType.BALANCE_OF_WITH_MULTIPLIER;
  }
  if (addr == '0xe6f7b1003ae775ff9a9bc977e36a4c3996efaac68d1c938161657eb78d40b8') {
    return VotingStrategyType.WHITELIST;
  }
  if (addr == '0x3de5b19d2dcdbb3415c37aeab4698e41a40dd35b7ad185cd08071ca0cbfc00c') {
    return VotingStrategyType.VANILLA;
  }
  return VotingStrategyType.UNKNOWN;
}
