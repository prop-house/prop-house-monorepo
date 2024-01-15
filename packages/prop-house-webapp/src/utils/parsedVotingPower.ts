import { GOV_POWER_OVERRIDES } from './roundOverrides';
import { BigNumber, ethers } from 'ethers';

// Parses voting power using on decimal points in GOV_POWER_OVERRIDES
export const parsedVotingPower = (votingPower: string, roundAddress: string) => {
  if (GOV_POWER_OVERRIDES[roundAddress]) {
    const formatted = ethers.utils.formatUnits(
      votingPower,
      GOV_POWER_OVERRIDES[roundAddress].decimals,
    );
    const bn = BigNumber.from(parseInt(formatted));
    return bn.gte(1) ? bn : BigNumber.from(0);
  } else {
    return BigNumber.from(votingPower);
  }
};
