import { expect } from 'chai';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { strategyForCommunity } from '../src/utils/strategyForCommunity';

describe('community strategies', () => {
  it('require that every community on production has a strategy', async () => {
    const wrapper = new PropHouseWrapper('https://prod.backend.prop.house');
    const communityAddresses = (await wrapper.getCommunities()).map(
      community => community.contractAddress,
    );
    communityAddresses.forEach(add => {
      const s = strategyForCommunity(add);
      if (s === undefined) console.log(`no strategy found for community with address: ${add}`);
      expect(strategyForCommunity(add)).to.not.be.undefined;
    });
  });
});
