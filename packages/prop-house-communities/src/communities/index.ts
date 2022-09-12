import { erc1155, onchainMonkey } from '../strategies';
import { nouns } from '../strategies/nouns';

/**
 * Contract addresses for communities that require custom voting strategy.
 */
export const communities = {
  // nouns
  '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03': nouns(10),
  // onchainmonkey
  '0x960b7a6bcd451c9968473f7bbfd9be826efd549a': onchainMonkey(),
  // the noun square team rewards
  '0xbfe00921005f86699760c84c38e3cc86d38745cf': erc1155(1, 1),
  // the noun square contests
  '0x7c2748c7ec984b559eadc39c7a4944398e34911a': erc1155(2, 1),
};
