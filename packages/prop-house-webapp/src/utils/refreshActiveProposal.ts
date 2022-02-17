import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { Dispatch } from 'redux';
import {
  setActiveProposal,
  setActiveProposals,
} from '../state/slices/propHouse';
import { RootState } from '../state/store';

const refreshActiveProposal = (
  client: PropHouseWrapper,
  activeProposal: StoredProposalWithVotes,
  dispatch: Dispatch
) => {
  client
    .getProposal(activeProposal.id)
    .then((proposal) => dispatch(setActiveProposal(proposal)));
};

export const refreshActiveProposals = (
  client: PropHouseWrapper,
  auctionId: number,
  dispatch: Dispatch
) => {
  client
    .getAuctionProposals(auctionId)
    .then((proposals) => dispatch(setActiveProposals(proposals)));
};

export default refreshActiveProposal;
