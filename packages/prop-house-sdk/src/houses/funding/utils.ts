import { assetUtils } from '../../utils';
import { AssetType, Award, Class } from './types';

/**
 * Given an array of human-readable award assets, generate asset ID and amount information
 * @param awards The human-readable award information
 */
export const getAssetIDsAndAmounts = (awards: Award[]) => {
  return awards.map(award => {
    switch (award.assetType) {
      case AssetType.ETH:
        return {
          amount: award.amount,
          assetId: assetUtils.getETHAssetID(),
        };
      case AssetType.ERC20:
        return {
          amount: award.amount,
          assetId: assetUtils.getERC20AssetID(award.address),
        };
      case AssetType.ERC721:
        return {
          amount: 1,
          assetId: assetUtils.getERC721AssetID(award.address, award.tokenId),
        };
      case AssetType.ERC1155:
        return {
          amount: award.amount,
          assetId: assetUtils.getERC1155AssetID(award.address, award.tokenId),
        };
      default:
        throw new Error(`Unknown award asset type: ${award}.`);
    }
  });
};

/**
 * Convert the type of class `C` to type `T`
 * @param c The class to convert
 */
export const as = <C, T>(c: Class<C>): new (...p: ConstructorParameters<Class<C>>) => T => {
  return c as unknown as new (...p: ConstructorParameters<Class<C>>) => T;
};
