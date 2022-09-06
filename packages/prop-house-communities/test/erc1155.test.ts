import { expect } from 'chai';
import { Contract, providers, utils } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import BalanceOfABI1155 from '../src/abi/BalanceOf1155ABI.json';
import { balanceOf, erc1155 } from '../src/strategies';

describe('erc1155 votes', () => {
  let apiKey;
  const nounSquareAddress = '0x7c2748c7ec984b559eadc39c7a4944398e34911a';
  const holderAddress = '0x0B20ED7418f153a6595E0F88c682DF52d54B00c4';

  before('jsonRpcProvider api key should be available in .env file', () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    expect(apiKey).to.be.not.empty;
  });

  it('package should have strategy for erc1155 fn', () => {
    expect(erc1155).to.not.be.undefined;
  });

  it('holder address should have a positive balance for tokenId 1', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(nounSquareAddress, BalanceOfABI1155, provider);
    const balanceOf = await contract.balanceOf(holderAddress, 1);
    const numBalanceOf = Number(utils.formatEther(balanceOf));

    expect(numBalanceOf).to.be.gt(0);
  });

  it('holder address should have a positive balance for tokenId 2', async () => {
    apiKey = process.env.INFURA_PROJECT_ID;
    if (!apiKey) return;
    const provider = new providers.JsonRpcProvider(infuraEndpoint(apiKey));

    const contract = new Contract(nounSquareAddress, BalanceOfABI1155, provider);
    const balanceOf = await contract.balanceOf(holderAddress, 2);
    const numBalanceOf = Number(utils.formatEther(balanceOf));

    expect(numBalanceOf).to.be.gt(0);
  });
});
