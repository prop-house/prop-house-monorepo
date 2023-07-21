import {
  nouns,
  lilNouns,
  onchainMonkey,
  balanceOfErc20,
  balanceOfErc721,
  balanceOfErc721Multiple,
  erc1155,
  oneHundredVotes,
  perWalletVoteErc20,
  fixedVotes,
} from '../strategies';
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
    // Anata
    '0xf729f878F95548BC7F14B127c96089cf121505F8': balanceOfErc721(),
    // Builder
    '0xdf9B7D26c8Fc806b1Ae6273684556761FF02d422': balanceOfErc721(1),
    // NSFW
    '0xa0aaf3b8a71dcb51fb61845899ab6df3e2c81ae3': balanceOfErc721(10),
    // Shark DAO
    '0x8277aCa3Aa9eCf15cB224346575C4130CF36dE00': balanceOfErc721(),
    // Tiny Dinos
    '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4': balanceOfErc721Multiple(
      [
        '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
        '0x5a1190759c9e7cf42da401639016f8f60affd465',
        '0xc1dcc70e27b187457709e0c72db3df941034ec6f',
        '0x89e83F99Bc48B9229EA7F2B9509a995e89C8472F',
      ],
      [1, 1, 1, 1],
    ),
    // Nouns DAO Amigos
    '0x964629a577ebD3d1cc9ce4361BDcc1ABb282132F': balanceOfErc721(10),
    // Nouns BR
    '0x36b2AA1795d8cdEf4B784Fe34045fAdC45d61e8c': balanceOfErc721(),
    // Kiwami
    '0x701A038aF4Bd0fc9b69A829DdcB2f61185a49568': balanceOfErc721(),
    // Humankind
    '0xb20e024da94fEf84B5dbDE3a639048952De58169': balanceOfErc721Multiple(
      [
        '0xb20e024da94fEf84B5dbDE3a639048952De58169',
        '0xA30CF1135BE5Af62E412f22BD01069e2CEbA8706',
        '0xceE9F881bb972CeCD5Df06c6111cE457b0d63F0B',
      ],
      [1, 1, 1],
    ),
    // Chaos
    '0xc16923543829f002E4A3f37e3E2e7CC9B8a87b96': balanceOfErc20(18),
    // Rug Radio
    '0x6235CAEea7C515DaC14060Ec23a760090655F21b': perWalletVoteErc20(18, 5),
    // Noggle DAO
    '0x567C3CC159b694F4A4ed6545A86EB4fd5c5169FD': balanceOfErc721(),
    // Headline
    '0x3e4a08b6dA666D7C239221E4429340975eC09C48': balanceOfErc721(10),
    // MferbuilderDAO
    '0x795D300855069F602862c5e23814Bdeeb25DCa6b': balanceOfErc721(10),
    // Nouns OTG
    '0x92c950729E292573Fbbc9C12F4b06656E0DAe91A': balanceOfErc721(10),
    // Seneca
    '0xba2b9804FbffA8F1A8F7DC8dd600E21268beF09F': fixedVotes(100, [
      '0xba2b9804FbffA8F1A8F7DC8dd600E21268beF09F',
    ]),
    // Index card
    '0x538eb7f9baef0a48b6d385d83f2f78d1d629166b': erc1155(1, 50),
    // Explorer Grants
    '0x93D94557824AC07A30b5B0f44f7CB3E00f9c4191': fixedVotes(100, [
      '0x93D94557824AC07A30b5B0f44f7CB3E00f9c4191',
    ]),
    // Trait works
    '0xe8f0b57a805b9a15fee874fdd8f6bc250a0d2c55': balanceOfErc721(10),
    // Own the Doge
    '0x07887Ee0Bd24E774903963d50cF4Ec6a0a16977D': balanceOfErc721(),
    // Noun 40
    '0xaE65E700f3f8904ac1007d47a5309dD26f8146c0': fixedVotes(100, [
      '0xaE65E700f3f8904ac1007d47a5309dD26f8146c0',
    ]),
    // Ed Cruz
    '0x7426B39865D11207B8F795b10D70843FC3289051': fixedVotes(100, [
      '0x7426B39865D11207B8F795b10D70843FC3289051',
    ]),
    // Eu
    '0xa47f60564085b8792BaE197BE7762C7f7930eC67': fixedVotes(100, [
      '0xa47f60564085b8792BaE197BE7762C7f7930eC67',
    ]),
    // Juicebox
    '0x3abF2A4f8452cCC2CF7b4C1e4663147600646f66': balanceOfErc20(18),
    // Infinite Retro Round
    '0x5EBFd1CAC809F947164F558a606c29e685c754d3': balanceOfErc721(1),
    // Florinouns
    '0x9b02525cec175cE12FF8281c8923b1De1F85Af92': balanceOfErc721(),
    // mxtter
    '0xBe2d48C0752713E342c869A50a7c33e00bf4C409': balanceOfErc721(),
    // nounish
    '0x89A814E79ce54B9bdc443779BEC7d9699De85D45': fixedVotes(100, [
      '0x89A814E79ce54B9bdc443779BEC7d9699De85D45',
    ]),
    // nouns esports
    '0x9a64c732c284fd248e71fb2d9850f47e6ef6e32d': balanceOfErc721(),
    // turbo voting token
    '0x141b0AD442a7Fc4B3742eCbc081f7110fE9bDD10': balanceOfErc721(),
    // nounfred
    '0x6802c9c19d1dE1325e0814eF61a92dCEb392C487': fixedVotes(100, [
      '0x6802c9c19d1dE1325e0814eF61a92dCEb392C487',
    ]),
    // panama dao
    '0xe403248c8F078Fd6729309635cdD0A668DDD20f9': balanceOfErc721(10),
    // rug radio grants
    '0x6066F888BF55366d13f83dF6a1fD355453D313EA': fixedVotes(1, [
      '0x6066F888BF55366d13f83dF6a1fD355453D313EA',
      '0xd9A9A52bc1529D3FF8Be57Af1AF7Ac09457F03cf',
      '0xb49cd1B6D47De8170a3E097591196387EA2d773a',
    ]),
    // purpler
    '0x8edceb20795ac2b93ab8635af77e96cae123d045': balanceOfErc721(3),
    // depepe
    '0xE310306A41b28D81b0Eac3A5452fD7fDFb67A37B': fixedVotes(100, [
      '0xE310306A41b28D81b0Eac3A5452fD7fDFb67A37B',
    ]),
    // gnars
    '0x558BFFF0D583416f7C4e380625c7865821b8E95C': balanceOfErc721(),
  }),
);
