import { expect } from 'chai';
import { BigNumber, Contract, providers } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import { getNumVotes } from '../src/actions';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { strategyForCommunity } from '../src/utils/strategyForCommunity';

describe('Lil Nouns delegation', () => {
  let apiKey;
  const nounsTokenAddress = '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B';
  const lilNounsHolder = '0x4754b7e3dede42d71d6c92978f25f306176ec7e9';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have custom strategy for lil nouns token contract', () => {
    expect(strategyForCommunity(nounsTokenAddress)).to.not.be.undefined;
  });

  it('lil nouns holder should have > 0 lil nouns balance', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(nounsTokenAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(lilNounsHolder, { blockTag: 15529004 });
    const numBalanceOf = BigNumber.from(balanceOf).toNumber();

    expect(numBalanceOf).to.be.gt(0);
  });

  it('lil nouns holder should have more delegated votes than lil nouns in balance', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    // balanceOf
    const contract = new Contract(nounsTokenAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(lilNounsHolder);
    const numBalanceOf = BigNumber.from(balanceOf).toNumber();

    // delegatedVotes
    const delegatedVotes = await getNumVotes(
      lilNounsHolder,
      nounsTokenAddress,
      provider,
      '15529004',
    );

    expect(numBalanceOf).to.be.lt(delegatedVotes);
  });
});
