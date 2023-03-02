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
  if (addr == '0x6c1189830a32ab24e966fa721fa6d3b5527f12b322f6824546240703e5b01b6') {
    return VotingStrategyType.BALANCE_OF;
  }
  if (addr == '0x3e86d292cc8b9c5a4348b74c64a665258ebb825157c4c8f8b812d1050aa07c9') {
    return VotingStrategyType.BALANCE_OF_WITH_MULTIPLIER;
  }
  if (addr == '0x7d55965689f0e1024a22e9f32c4c4a10b90ba87ee902216e19626cf1cd17061') {
    return VotingStrategyType.WHITELIST;
  }
  if (addr == '0xff15c4f811828ba80fb12dd9ab8a17bdaab6e0ec19041ac5866dc93d140cab') {
    return VotingStrategyType.VANILLA;
  }
  return VotingStrategyType.UNKNOWN;
}
