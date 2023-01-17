import { expect } from 'chai';
import { BigNumber, Contract, providers } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import BalanceOfABI from '../src/abi/BalanceOfABI.json';
import { strategyForCommunity } from '../src/utils/strategyForCommunity';
import { onchainMonkey } from '../src/strategies';

describe('custom OCM', () => {
  let apiKey;
  const onChainMonkeyAddress = '0x960b7a6bcd451c9968473f7bbfd9be826efd549a';
  const karmaAddress = '0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b';
  const holderAddress = '0xd25e6454bcdfd0db4f35787c4774b2033624ebeb';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have custom strategy for OCM contract address', () => {
    expect(strategyForCommunity(onChainMonkeyAddress)).to.not.be.undefined;
  });

  it('holder address should have a positive balance for OCM', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(onChainMonkeyAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(holderAddress);
    const numBalanceOf = balanceOf.toNumber();

    expect(numBalanceOf).to.be.gt(0);
  });

  it('holder address should have a positive balance for Karma', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(karmaAddress, BalanceOfABI, provider);
    const balanceOf = await contract.balanceOf(holderAddress);
    const numBalanceOf = balanceOf.toNumber();

    expect(numBalanceOf).to.be.gt(0);
  });

  it('custom strategy should return sum of balance from OCM and Karma contracts + bonus', async () => {
    // custom logic: X + Y + min(X,Y)

    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const ocmContract = new Contract(onChainMonkeyAddress, BalanceOfABI, provider);
    const ocmBalanceOf = await ocmContract.balanceOf(holderAddress);

    const karmaContract = new Contract(karmaAddress, BalanceOfABI, provider);
    const karmaBalanceOf = await karmaContract.balanceOf(holderAddress, { blockTag: 16398781 });

    const sum = BigNumber.from(ocmBalanceOf).add(BigNumber.from(karmaBalanceOf)).toNumber();
    const min = Math.min(
      BigNumber.from(ocmBalanceOf).toNumber(),
      BigNumber.from(karmaBalanceOf).toNumber(),
    );

    const votes = await onchainMonkey()(holderAddress, onChainMonkeyAddress, 16398781, provider);

    expect(votes).to.eq(sum + min);
  });
});
