import { Round, Proposal } from '@prophouse/sdk-react';
import { GOV_POWER_OVERRIDES } from './roundOverrides';
import { ethers } from 'ethers';

// Parses prop voting power using on decimal points in GOV_POWER_OVERRIDES
export const parsedPropVotingPower = (proposal: Proposal, round: Round) => {
  if (GOV_POWER_OVERRIDES[round.address]) {
    let parsed = parseInt(
      ethers.utils.formatUnits(proposal.votingPower, GOV_POWER_OVERRIDES[round.address].decimals),
    );
    return parsed >= 1 ? parsed : 0;
  } else {
    return parseInt(proposal.votingPower);
  }
};
