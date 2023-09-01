import { SignatureState, Community, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import { VoteAllotment } from '../types/VoteAllotment';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

export const submitVotes = async (
  voteAllotments: VoteAllotment[],
  roundChainBlockNumber: number,
  community: Community,
  propHouseWrapper: PropHouseWrapper,
  isContract?: boolean,
) => {
  try {
    const votes = voteAllotments
      .map(
        a =>
          new Vote(
            a.direction,
            a.proposalId,
            a.votes,
            community.contractAddress,
            SignatureState.PENDING_VALIDATION,
            roundChainBlockNumber,
          ),
      )
      .filter(v => v.weight > 0);

    await propHouseWrapper.logVotes(votes, isContract);
  } catch (e) {
    throw e;
  }
};
