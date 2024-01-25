import { AssetType, Deposit, ERC20, ERC721, Reclaim } from '@prophouse/sdk-react';

/**
 * Finds a reclaim for a given deposit if the depositor, asset type, and asset details match.
 */
export const reclaimForDeposit = (deposit: Deposit, reclaims: Reclaim[]) => {
  return reclaims.find(r => {
    if (deposit.depositor.toLowerCase() !== r.reclaimer.toLowerCase()) return undefined;
    if (deposit.asset.assetType !== r.asset.assetType) return undefined;
    if (
      deposit.asset.assetType === AssetType.ERC20 &&
      deposit.asset.address === (r.asset as ERC20).address
    )
      return r;
    if (
      (deposit.asset.assetType === AssetType.ERC721 ||
        deposit.asset.assetType === AssetType.ERC1155) &&
      deposit.asset.address === (r.asset as ERC721).address &&
      deposit.asset.tokenId === (r.asset as ERC721).tokenId
    )
      return r;

    return undefined;
  });
};
