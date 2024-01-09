import { GOV_POWER_OVERRIDES } from './roundOverrides';
import { ethers } from 'ethers';

// Parses voting power using on decimal points in GOV_POWER_OVERRIDES
export const parsedVotingPower = (votingPower: string, roundAddress: string) => {
  if (GOV_POWER_OVERRIDES[roundAddress]) {
    let parsed = parseInt(
      ethers.utils.formatUnits(votingPower, GOV_POWER_OVERRIDES[roundAddress].decimals),
    );
    return parsed >= 1 ? parsed : 0;
  } else {
    return parseInt(votingPower);
  }
};
