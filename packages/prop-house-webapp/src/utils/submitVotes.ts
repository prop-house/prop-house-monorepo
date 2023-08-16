import {
  SignatureState,
  Community,
  StoredAuctionBase,
  Vote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { fetchBlockNumber } from '@wagmi/core';
import { VoteAllotment } from '../types/VoteAllotment';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

export const submitVotes = async (
  voteAllotments: VoteAllotment[],
  round: StoredAuctionBase,
  community: Community,
  propHouseWrapper: PropHouseWrapper,
  isContract?: boolean,
) => {
  try {
    const blockHeight = await fetchBlockNumber({ chainId: round.voteStrategy.chainId });
    const votes = voteAllotments
      .map(
        a =>
          new Vote(
            a.direction,
            a.proposalId,
            a.votes,
            community.contractAddress,
            SignatureState.PENDING_VALIDATION,
            blockHeight,
          ),
      )
      .filter(v => v.weight > 0);

    await propHouseWrapper.logVotes(votes, isContract);
  } catch (e) {
    throw e;
  }
};
