import { expect } from 'chai';
import { Contract, providers } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { balanceOfErc721 } from '../src/strategies';

describe('balanceOf ERC721 votes', () => {
  let apiKey;
  const nounsDaoTreasury = '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10';
  const lilNounsToken = '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have strategy for balanceOfErc721', () => {
    expect(balanceOfErc721).to.not.be.undefined;
  });

  it('nouns dao treasury should have a positive balance of lil nouns nfts', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(lilNounsToken, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(nounsDaoTreasury, { blockTag: 15485382 });
    const numBalanceOf = balanceOf.toNumber();

    const lilNounsBalance = await balanceOfErc721()(
      nounsDaoTreasury,
      lilNounsToken,
      '15485382',
      provider,
    );

    expect(numBalanceOf).to.be.eq(lilNounsBalance);
  });
});
