import { BaseArgs } from '../actions/execStrategy';
import { StrategyFactory, _Strategy } from '../types/_Strategy';

export const kiwi: StrategyFactory<BaseArgs> = (params: BaseArgs): _Strategy => {
  return async () => {
    const { account } = params;
    const voter = votingPower.find(v => v.address.toLowerCase() === account.toLowerCase());
    return voter ? voter.votes : 0;
  };
};

const votingPower = [
  {
    address: '0xee324c588ceF1BF1c1360883E4318834af66366d',
    karma: 1412,
    votes: 37,
  },
  {
    address: '0x3e6c23CdAa52B1B6621dBb30c367d16ace21F760',
    karma: 792,
    votes: 28,
  },
  {
    address: '0xC304Eef1023e0b6e644f8ED8f8c629fD0973c52d',
    karma: 215,
    votes: 14,
  },
  {
    address: '0x3601a913fD3466f30f5ABb978E484d1B37Ce995D',
    karma: 133,
    votes: 11,
  },
  {
    address: '0x7252921bD62996dE2fC352710AeA0295a4143218',
    karma: 132,
    votes: 11,
  },
  {
    address: '0xCf7ecA52dE76E72e562ADddb513CeF4c609f1fd2',
    karma: 131,
    votes: 11,
  },
  {
    address: '0x2aA33413Eaa4D1F43A78C36C8D00f6977bb06051',
    karma: 125,
    votes: 11,
  },
  {
    address: '0xFEdE2257Dc043f53a24Ac7947218BACfB0013B09',
    karma: 108,
    votes: 10,
  },
  {
    address: '0x3B60e31CFC48a9074CD5bEbb26C9EAa77650a43F',
    karma: 69,
    votes: 8,
  },
  {
    address: '0xe6C97606be089A0455EF944B49588596f62136d3',
    karma: 64,
    votes: 8,
  },
  {
    address: '0x29B482446dD1B84B356CB65916d2695992f7BEa4',
    karma: 64,
    votes: 8,
  },
  {
    address: '0x38e8A52Ee60ea89A5b086cD0D3dA4108EFD4827E',
    karma: 63,
    votes: 7,
  },
  {
    address: '0x14B85b1c40056312fde55E1Fa1827a92F12B966A',
    karma: 61,
    votes: 7,
  },
  {
    address: '0x2F60D2BB84Eb8df6951F7215ef035eF052BA2725',
    karma: 57,
    votes: 7,
  },
  {
    address: '0xeE6fb338E75C43cc9153FF86600700459e9871Da',
    karma: 54,
    votes: 7,
  },
  {
    address: '0xb03F5438f9A243De5C3B830B7841EC315034cD5f',
    karma: 48,
    votes: 6,
  },
  {
    address: '0x0DF5Ba52e8C055950AaAf5fcFE829020e898ee60',
    karma: 47,
    votes: 6,
  },
  {
    address: '0x19ce57B670121E73E43be6c2Fea5C254bb4C8760',
    karma: 42,
    votes: 6,
  },
  {
    address: '0xF34196597dF209A04Fc92B97071DCAAbbC63f0E8',
    karma: 41,
    votes: 6,
  },
  {
    address: '0x96a77560146501eAEB5e6D5B7d8DD1eD23DEfa23',
    karma: 39,
    votes: 6,
  },
  {
    address: '0x6F73ea756BD57D3adCAfB73A4f5Fcd750EC1c387',
    karma: 39,
    votes: 6,
  },
  {
    address: '0xed727248627fda303a1794F5da747215B6314330',
    karma: 37,
    votes: 6,
  },
  {
    address: '0x28a69640810FcDcF6Adb7119edD64eeD4612Fa49',
    karma: 35,
    votes: 5,
  },
  {
    address: '0xa260CF1726a6a5e0B7079f708823FC8E884611CB',
    karma: 29,
    votes: 5,
  },
  {
    address: '0x380604e85E772f51014636Aa72B107F163609DdE',
    karma: 27,
    votes: 5,
  },
  {
    address: '0x1a33b79427C2E4d3Ab8a18FDdc50b1c2785A895A',
    karma: 26,
    votes: 5,
  },
  {
    address: '0x77B476429826C5ba77885D08F272d89D8F1Ed0e4',
    karma: 25,
    votes: 5,
  },
  {
    address: '0xCEEd9585854F12F81A0103861b83b995A64AD915',
    karma: 23,
    votes: 4,
  },
  {
    address: '0x0Fc0F78fc939606db65F5BBF2F3715262C0b2F6E',
    karma: 22,
    votes: 4,
  },
  {
    address: '0x138811332293f081D24e63D40aB18b4AF520378A',
    karma: 21,
    votes: 4,
  },
  {
    address: '0x78d32460D0a53Ac2678e869Eb6b4f6bA9d2Ef360',
    karma: 21,
    votes: 4,
  },
  {
    address: '0x33fc2bE5563e3c02a3e127F01Bbd71Db472Aa613',
    karma: 20,
    votes: 4,
  },
  {
    address: '0x2a80B08bE5574F7BDF95757bCbb075BcD48f6C03',
    karma: 19,
    votes: 4,
  },
  {
    address: '0xD01559BB03cc83d4661193b513e5A083Ad0cc8Cf',
    karma: 19,
    votes: 4,
  },
  {
    address: '0x80E451777dCD4E4a589a038A61b1dca72d718045',
    karma: 17,
    votes: 4,
  },
  {
    address: '0x0263D82a119a20f0A4992F11081B1B4746cA8c89',
    karma: 17,
    votes: 4,
  },
  {
    address: '0x538527f3602acaD78596F17B422Fcf5613Af1409',
    karma: 17,
    votes: 4,
  },
  {
    address: '0x035eBd096AFa6b98372494C7f08f3402324117D3',
    karma: 17,
    votes: 4,
  },
  {
    address: '0xc2fB4B3EA53E10c88D193E709A81C4dc7aEC902e',
    karma: 17,
    votes: 4,
  },
  {
    address: '0x64c4Bffb220818F0f2ee6DAe7A2F17D92b359c5d',
    karma: 16,
    votes: 4,
  },
  {
    address: '0xf63c1D0B96572C02aEe09761d9254779EA1Ceb2A',
    karma: 16,
    votes: 4,
  },
  {
    address: '0x983e39ce1302bF95161335d8AFb3091F42c20624',
    karma: 16,
    votes: 4,
  },
  {
    address: '0x67243d6c3c3bDc2F59D2f74ba1949a02973a529d',
    karma: 16,
    votes: 4,
  },
  {
    address: '0xdB79e7E9e1412457528e40db9fCDBe69f558777d',
    karma: 16,
    votes: 4,
  },
  {
    address: '0x72aA5ad78FB4F2E567A5df833dad12F60B52DB63',
    karma: 15,
    votes: 3,
  },
  {
    address: '0xA49958fa14309F3720159c83cD92C5F38B1e3306',
    karma: 14,
    votes: 3,
  },
  {
    address: '0x13eEf4EF8FCa471f242ab0F8F49A3dB6017aDA33',
    karma: 14,
    votes: 3,
  },
  {
    address: '0xDc3BB7ebfFA056Fa67A6d3a5F1BCd96379b8B6D0',
    karma: 14,
    votes: 3,
  },
  {
    address: '0x16d7034610dB82FD30FFc9667F4B4f55e2b8541f',
    karma: 14,
    votes: 3,
  },
  {
    address: '0x7e07064E5A921A57Eb29C22F179B20513e8a3485',
    karma: 14,
    votes: 3,
  },
  {
    address: '0xEE3CA4dd4CeB3416915Eddc6cDaDB4A6060434d4',
    karma: 13,
    votes: 3,
  },
  {
    address: '0xDFe8beeE223412F316baf2968B17527D6EbA29F1',
    karma: 13,
    votes: 3,
  },
  {
    address: '0xb6f6Dce6000cA88cC936B450cEDB16a5c15f157f',
    karma: 13,
    votes: 3,
  },
  {
    address: '0x3c9D92A145b17b7dF69d22eFF292499B2849ee83',
    karma: 13,
    votes: 3,
  },
  {
    address: '0x61Da82d341141DbaFc8b536eEdb23e7D83496c7c',
    karma: 13,
    votes: 3,
  },
  {
    address: '0x68d36DcBDD7Bbf206e27134F28103abE7cf972df',
    karma: 12,
    votes: 3,
  },
  {
    address: '0x9852dA6c3C66Cf6d4509c314c7299b8f798868A9',
    karma: 12,
    votes: 3,
  },
  {
    address: '0x2F81b3343EaFD6208a2F98e5a89C6af6025Ebc8D',
    karma: 12,
    votes: 3,
  },
  {
    address: '0x3DedB545E9B89f63FA71Ab75497735d802C9d26F',
    karma: 11,
    votes: 3,
  },
  {
    address: '0x3eE75b599c076193b81885Ca1838e560d268aAD1',
    karma: 11,
    votes: 3,
  },
  {
    address: '0xEC8b6b6ee8dC5c6631747BDC6b1400Aff08829fD',
    karma: 11,
    votes: 3,
  },
  {
    address: '0xfF51cc1519c7a61144d3FF6F883122f150752445',
    karma: 10,
    votes: 3,
  },
  {
    address: '0x96A86E7dDE5D2E655Cb9A60216f35fC3af182866',
    karma: 10,
    votes: 3,
  },
  {
    address: '0xDd0c58A610466D5Fa54E27817C3433006257BDB2',
    karma: 10,
    votes: 3,
  },
  {
    address: '0xE943CA883ef3294E0FC55a1A14591aBeAD1B5927',
    karma: 10,
    votes: 3,
  },
  {
    address: '0x10676738Db9601C5AF144A17C3A48C8eBDA7E353',
    karma: 10,
    votes: 3,
  },
  {
    address: '0xeaf55242a90bb3289dB8184772b0B98562053559',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x461bb1c0c23C0AE24805C4097Bc5B64593Dd2a59',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x7e37C3A9349227B60503DDB1574A76d10C6bc48E',
    karma: 9,
    votes: 3,
  },
  {
    address: '0xAA64A7Db2C3951375dCDF8DB76ADb46C258840E7',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x32a6f3De4D2610eC943b6c20ac3341b30Dc18d23',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x503a04D04E00d9b0C0898e2D7A16B857BE6cdAF0',
    karma: 9,
    votes: 3,
  },
  {
    address: '0xa0b08b718a332a1B7b2C9A6482CA5dFD87B7eE34',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x51434F6502b6167ABEC98Ff9F5fd37Ef3E07E7d2',
    karma: 9,
    votes: 3,
  },
  {
    address: '0x9EAB9D856a3a667dc4CD10001D59c679C64756E7',
    karma: 8,
    votes: 2,
  },
  {
    address: '0xD5b472FfAF39476F83B8975667169AB6F9216dCD',
    karma: 8,
    votes: 2,
  },
  {
    address: '0xf6591C74c46762d94765a6aD27368ceaf5CeA475',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x04655832bcb0a9a0bE8c5AB71E4D311464c97AF5',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x34C3A5ea06a3A67229fb21a7043243B0eB3e853f',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x6002cA2e11B8e8c0F1F09c67F551B209eb51A0E4',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x79d31bFcA5Fda7A4F15b36763d2e44C99D811a6C',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x38EED3CCeED88f380E436eb21811250797c453C5',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x1E34a0DAEeDd3Aaaee515c92791e860591B04F0c',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x806164c929Ad3A6f4bd70c2370b3Ef36c64dEaa8',
    karma: 8,
    votes: 2,
  },
  {
    address: '0xFD0afAa85a72468b02827C418cB3B40a9a2F5467',
    karma: 8,
    votes: 2,
  },
  {
    address: '0x7ad252FACf5F1115B22EA0A4D63E8770573d78a2',
    karma: 7,
    votes: 2,
  },
  {
    address: '0x0b5c8b438e1C47fa8F2B2d27F051dBCBA84c65aF',
    karma: 7,
    votes: 2,
  },
  {
    address: '0x26E3a9c84fdB9b7fE33Dfd5E8D273D016e4e4Fb6',
    karma: 7,
    votes: 2,
  },
  {
    address: '0x5C8F77BE6639CBd5B669e409c610926Cc4E0E6Ae',
    karma: 7,
    votes: 2,
  },
  {
    address: '0x4C53C6D546C9E38db56040Ab505460A9187A5281',
    karma: 7,
    votes: 2,
  },
  {
    address: '0xD7029BDEa1c17493893AAfE29AAD69EF892B8ff2',
    karma: 6,
    votes: 2,
  },
  {
    address: '0x11270bB15D07A658eE379236c005439E7131A25a',
    karma: 6,
    votes: 2,
  },
  {
    address: '0xaAcD601c5377ddf3F1f41eb1758bA0d2fA2b39BD',
    karma: 6,
    votes: 2,
  },
  {
    address: '0x09cc4B3a27E3715596c5eDE07E95Da490340D27a',
    karma: 6,
    votes: 2,
  },
  {
    address: '0x29E905909707E68892933FfE385403a67ab0a07d',
    karma: 6,
    votes: 2,
  },
  {
    address: '0x2B49302355d1Cb7a3f1450fA1f04627356EcABf9',
    karma: 5,
    votes: 2,
  },
  {
    address: '0x64Ff33b653B26edCb4644E27d3720F3C653F8371',
    karma: 5,
    votes: 2,
  },
  {
    address: '0x0e467A0288A439BA2678eb7d3B0B64b01e2bBBfC',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x0Aa34EB615ab330b64060ff9Fa994E72A7A95B59',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x5f57C686bdbc03242C8Fa723B80f0A6CDea79546',
    karma: 4,
    votes: 2,
  },
  {
    address: '0xDD1256D5C133F21bE2A7C981FC83c8cB0F66E286',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x1203ef354cd5c228D5De2E7633Ed6685FfcEC1b1',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x30734D5AE63a2F368aCFB3D3A15E180169254b8a',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x00FdCD4eE926a404DC9c80889F816249A9fBB8D8',
    karma: 4,
    votes: 2,
  },
  {
    address: '0xf3B06b503652a5E075D423F97056DFde0C4b066F',
    karma: 4,
    votes: 2,
  },
  {
    address: '0x6689B9D1642bb413C74c35EeBA13165F755f26FE',
    karma: 3,
    votes: 1,
  },
  {
    address: '0xFA2Cd9b0E716697fF5d70F0e4AfB7C2E5BA405d0',
    karma: 3,
    votes: 1,
  },
  {
    address: '0x84673f99d9807780ce5Db4c3A980d708535d9604',
    karma: 3,
    votes: 1,
  },
  {
    address: '0xE41f56122d44f63c4492096d54D8BE96d600bB06',
    karma: 3,
    votes: 1,
  },
  {
    address: '0x0964256674E42d61f0fF84097E28F65311786ccb',
    karma: 2,
    votes: 1,
  },
  {
    address: '0xeF42cF85bE6aDf3081aDA73aF87e27996046fE63',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x281D479A15b92A87754316Ec43D2817cCC2a22f1',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x27629B5d175E899a19eD6B3a96016377d5eE4768',
    karma: 2,
    votes: 1,
  },
  {
    address: '0xE84597487Bb786eE19724192208D4Ed0E76E3018',
    karma: 2,
    votes: 1,
  },
  {
    address: '0xa62ba163e57219fa1e67ec21cC101B5E5167D111',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x5bb3e1774923b75Ecb804E2559149BbD2a39A414',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x729170d38dD5449604f35f349FdFcc9aD08257cD',
    karma: 2,
    votes: 1,
  },
  {
    address: '0xA9a317455C4a2fB52D5173Bc3d9fDB1cfe5b0E3E',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x6f25A0DD4c3BD4eF1A89916B3E0162061249885a',
    karma: 2,
    votes: 1,
  },
  {
    address: '0x0F9Bd2a9E0D30f121c525DB5419A07b08Fce8440',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x11C47Bb644cBAa54c7Bc651D46B9B399DA832171',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x553F2Dc3F12f85D05D88536A2fe5400f3a395F95',
    karma: 1,
    votes: 1,
  },
  {
    address: '0xF298A514fB38475EF2893759Fb71251DaeD43bFb',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x648B8ad47E540a71ABaE5C285ECc1e6D34eaB8C3',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x646E95f6852035a41F34b0B27A2067b29814307B',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x8957e95950BCf7E40BA2BD8007b47Ac67dCffa2D',
    karma: 1,
    votes: 1,
  },
  {
    address: '0x135C21b2DA426760718E39DA954974c4572AE9f6',
    karma: 1,
    votes: 1,
  },
  {
    address: '0xfecD03f0bB014CB4AC064D6DA9988c341c1d3864',
    karma: 1,
    votes: 1,
  },
];
