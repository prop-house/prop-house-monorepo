import { expect } from 'chai';
import { providers } from 'ethers';
import { infuraEndpoint } from './src/constants/infuraEndpoint';
import { erc1155 } from '../src/strategies';
import { getVotingPower } from '../src/actions';

describe('erc1155 votes', () => {
  let apiKey;
  const nounsSquareTeamAddress = '0xbfe00921005f86699760c84c38e3cc86d38745cf';
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
    const votes = await getVotingPower(holderAddress, nounsSquareTeamAddress, provider, 15435382);
    expect(votes).to.be.eq(100);
  });
});
