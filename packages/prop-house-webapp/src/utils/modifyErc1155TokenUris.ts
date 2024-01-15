import { ERC1155 } from '@prophouse/sdk-react';

/**
 * Handles edge cases for erc1155 tokenURIs
 */
export const erc1155TokenUriMods = (tokenUri: string, asset: ERC1155) => {
  return tokenUri.replace('{id}', asset.tokenId.toString());
};
