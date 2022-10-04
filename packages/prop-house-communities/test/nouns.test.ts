import { expect } from 'chai';
import { BigNumber, Contract, providers } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import { getNumVotes } from '../src/actions';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { strategyForCommunity } from '../src/utils/strategyForCommunity';

describe('Nouns delegation', () => {
  let apiKey;
  const nounsTokenAddress = '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03';
  const nounderSafeAddress = '0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have custom strategy for nouns contract address', () => {
    expect(strategyForCommunity(nounsTokenAddress)).to.not.be.undefined;
  });

  it('nounder address should have > 0 balance', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(nounsTokenAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(nounderSafeAddress, { blockTag: 15529004 });
    const numBalanceOf = BigNumber.from(balanceOf).toNumber();

    expect(numBalanceOf).to.be.gt(0);
  });

  it('nounder address should have more delegated votes than nouns in balance', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    // balanceOf
    const contract = new Contract(nounsTokenAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(nounderSafeAddress);
    const numBalanceOf = BigNumber.from(balanceOf).toNumber();

    // delegatedVotes
    const delegatedVotes = await getNumVotes(
      nounderSafeAddress,
      nounsTokenAddress,
      provider,
      15529004,
    );

    // remove multiplier
    const normalizedDelegatedVotes = delegatedVotes / 10;
    expect(numBalanceOf).to.be.lt(normalizedDelegatedVotes);
  });
});
