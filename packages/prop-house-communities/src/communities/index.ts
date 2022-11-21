import { balanceOfErc721, balanceOfErc721Multiple, erc1155, oneHundredVotes } from '../strategies';
import { lilNouns } from '../strategies/lilNouns';
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
    '0x960b7a6bcd451c9968473f7bbfd9be826efd549a': balanceOfErc721Multiple(
      ['0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b', '0x960b7a6bcd451c9968473f7bbfd9be826efd549a'],
      [1, 1],
    ),
    // cryptoadz
    '0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6': balanceOfErc721(),
    // nouns japan
    '0x898a7dbfddf13962df089fbc8f069fa7ce92cdbb': balanceOfErc721Multiple(
      ['0x898a7dbfddf13962df089fbc8f069fa7ce92cdbb', '0x866648ef4dd51e857ca05ea200ed5d5d0c6f93ce'],
      [1, 1],
    ),
    // nounpunks
    '0xe169c2ed585e62b1d32615bf2591093a629549b6': balanceOfErc721(),
    // uma
    '0x2381b67c6f1cb732fdf8b3b29d3260ec6f7420bc': balanceOfErc721(),
    // lil nouns
    '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B': lilNouns(),
    // mfers
    '0x79FCDEF22feeD20eDDacbB2587640e45491b757f': balanceOfErc721(),
    // test house
    '0x0000000000000000000000000000000000000000': oneHundredVotes(),
    // foodnouns
    '0xF5331380e1d19757388A6E6198BF3BDc93D8b07a': balanceOfErc721(),
    // the noun square contests
    '0x7c2748c7ec984b559eadc39c7a4944398e34911a': erc1155(2, 1),
    // coordinouns
    '0xbfe00921005f86699760c84c38e3cc86d38745cf': erc1155(1, 100),
    // purple
    '0xa45662638E9f3bbb7A6FeCb4B17853B7ba0F3a60': balanceOfErc721(10),
    // meebits
    '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7': balanceOfErc721(),
    // VesselVerse
    '0x2Fd43FfA417C1F9e9E260fdE9a0B59fC2AB22069': balanceOfErc721Multiple(
      ['0x2Fd43FfA417C1F9e9E260fdE9a0B59fC2AB22069', '0x15D019034cd704F4101a0B522aB8999dF42E0FB2'],
      [1, 2],
    ),
    // The LP
    '0x38930aae699c4cd99d1d794df9db41111b13092b': balanceOfErc721(),
  }),
);
