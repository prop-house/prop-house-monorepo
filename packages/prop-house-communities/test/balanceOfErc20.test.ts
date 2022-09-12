import { expect } from 'chai';
import { Contract, providers, utils } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { balanceOfErc20, balanceOfErc721 } from '../src/strategies';

describe('balanceOf ERC20 votes', () => {
  let apiKey;
  const genesisAddress = '0x0000000000000000000000000000000000000000';
  const daiErc20Address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have strategy for balanceOf', () => {
    expect(balanceOfErc721).to.not.be.undefined;
  });

  it('erc20 test: genesis address should have a positive balance of DAI', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(daiErc20Address, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(genesisAddress, { blockTag: 15485382 });
    const numBalanceOf = Number(utils.formatEther(balanceOf));

    const votes = await balanceOfErc20(18)(genesisAddress, daiErc20Address, '15485382', provider);

    expect(numBalanceOf.toFixed(0)).to.be.eq(votes.toFixed(0));
  });
});
