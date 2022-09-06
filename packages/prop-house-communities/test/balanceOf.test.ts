import { expect } from 'chai';
import { Contract, providers, utils } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { balanceOf } from '../src/strategies';
import { getNumVotes } from '../src/actions';

describe('balanceOf votes', () => {
  let apiKey;
  const genesisAddress = '0x0000000000000000000000000000000000000000';
  const daiErc20Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  const nounsDaoTreasury = '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10';
  const lilNounsToken = '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have strategy for balanceOf', () => {
    expect(balanceOf).to.not.be.undefined;
  });

  it('erc20 test: genesis address should have a positive balance of DAI', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(daiErc20Address, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(genesisAddress, { blockTag: 15485382 });
    const numBalanceOf = Number(utils.formatEther(balanceOf));

    const votes = await getNumVotes(genesisAddress, daiErc20Address, provider, '15485382');

    expect(numBalanceOf).to.be.eq(votes);
  });

  it('erc721 test: nouns dao treasury should have a positive balance of lil nouns nfts', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(lilNounsToken, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(nounsDaoTreasury, { blockTag: 15485382 });
    const numBalanceOf = balanceOf.toNumber();

    const lilNounsBalance = await getNumVotes(
      nounsDaoTreasury,
      lilNounsToken,
      provider,
      '15485382',
    );

    expect(numBalanceOf).to.be.eq(lilNounsBalance);
  });
});
