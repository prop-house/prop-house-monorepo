import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  StoredAuctionBase,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Dispatch } from 'redux';
import {
  filterInfRoundProposals,
  InfRoundFilterType,
  setActiveProposal,
  setActiveProposals,
  sortTimedRoundProposals,
  TimedRoundSortType,
} from '../state/slices/propHouse';
import { AuctionStatus, auctionStatus } from './auctionStatus';
import { isInfAuction } from './auctionType';

const refreshActiveProposal = (
  client: PropHouseWrapper,
  activeProposal: StoredProposalWithVotes,
  dispatch: Dispatch,
) => {
  client.getProposal(activeProposal.id).then(proposal => dispatch(setActiveProposal(proposal)));
};

export const refreshActiveProposals = async (
  client: PropHouseWrapper,
  auction: StoredAuctionBase,
  dispatch: Dispatch,
) => {
  const proposals = await client.getAuctionProposals(auction.id);
  dispatch(setActiveProposals(proposals));
  if (isInfAuction(auction)) {
    dispatch(filterInfRoundProposals({ type: InfRoundFilterType.Active, round: auction }));
  } else {
    const isRoundOver = auction && auctionStatus(auction) === AuctionStatus.AuctionEnded;
    const isVotingWindow = auction && auctionStatus(auction) === AuctionStatus.AuctionVoting;
    dispatch(
      sortTimedRoundProposals({
        sortType:
          isVotingWindow || isRoundOver
            ? TimedRoundSortType.VoteCount
            : TimedRoundSortType.CreatedAt,
        ascending: false,
      }),
    );
  }
};

export default refreshActiveProposal;
