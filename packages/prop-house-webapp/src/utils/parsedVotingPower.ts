import { GOV_POWER_OVERRIDES } from './roundOverrides';
import { BigNumber as BN, ethers } from 'ethers';
import BigNumber from 'bignumber.js';

// Parses voting power using on decimal points in GOV_POWER_OVERRIDES
export const parsedVotingPower = (votingPower: string, roundAddress: string) => {
  const bigNumber = new BigNumber(votingPower);

  if (GOV_POWER_OVERRIDES[roundAddress]) {
    const formatted = ethers.utils.formatUnits(
      bigNumber.toFixed(),
      GOV_POWER_OVERRIDES[roundAddress].decimals,
    );
    const bn = BN.from(parseInt(formatted));
    return bn.gte(1) ? bn : BN.from(0);
  } else {
    return BN.from(votingPower);
  }
};
