import { PropHouse, Proposal, Round, RoundState } from '@prophouse/sdk-react';
import { Dispatch } from 'redux';
import {
  filterInfRoundProposals,
  InfRoundFilterType,
  setActiveProposal,
  setActiveProposals,
  sortTimedRoundProposals,
  TimedRoundSortType,
} from '../state/slices/propHouse';
import { isInfAuction } from './auctionType';

const refreshActiveProposal = (
  propHouse: PropHouse,
  activeProposal: Proposal,
  dispatch: Dispatch,
) => {
  propHouse.query.getProposal(activeProposal.round, activeProposal.id).then(proposal => dispatch(setActiveProposal(proposal)));
};

export const refreshActiveProposals = async (
  propHouse: PropHouse,
  round: Round,
  dispatch: Dispatch,
) => {
  const proposals = await propHouse.query.getProposalsForRound(round.address);
  dispatch(setActiveProposals(proposals));
  if (isInfAuction(round)) {
    dispatch(filterInfRoundProposals({ type: InfRoundFilterType.Active, round }));
  } else {
    dispatch(
      sortTimedRoundProposals({
        sortType:
          round.state >= RoundState.IN_VOTING_PERIOD
            ? TimedRoundSortType.VoteCount
            : TimedRoundSortType.CreatedAt,
        ascending: false,
      }),
    );
  }
};

export default refreshActiveProposal;
