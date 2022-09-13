import { balanceOfErc721, erc1155, onchainMonkey } from '../strategies';
import { nouns } from '../strategies/nouns';
import { CaseInsensitiveMap } from '../types/CaseInsensitiveMap';

/**
 * Contract addresses for communities that require custom voting strategy.
 */
export const communities = new CaseInsensitiveMap(
  Object.entries({
    // nouns
    '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03': nouns(10),
    // onchainmonkey
    '0x960b7a6bcd451c9968473f7bbfd9be826efd549a': onchainMonkey(),
    // the noun square team rewards
    '0xbfe00921005f86699760c84c38e3cc86d38745cf': erc1155(1, 1),
    // the noun square contests
    '0x7c2748c7ec984b559eadc39c7a4944398e34911a': erc1155(2, 1),
    // cryptoadz
    '0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6': balanceOfErc721(),
    // nouns japan
    '0x898a7dbfddf13962df089fbc8f069fa7ce92cdbb': balanceOfErc721(),
    // nounpunks
    '0xe169c2ed585e62b1d32615bf2591093a629549b6': balanceOfErc721(),
    // uma
    '0x2381b67c6f1cb732fdf8b3b29d3260ec6f7420bc': balanceOfErc721(),
    // lil nouns
    '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B': balanceOfErc721(),
    // mfers
    '0x79FCDEF22feeD20eDDacbB2587640e45491b757f': balanceOfErc721(),
  }),
);
