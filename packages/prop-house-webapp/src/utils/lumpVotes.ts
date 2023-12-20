import { Vote } from '@prophouse/sdk-react';

/**
 * Lumps votes of the same voters that are next to each other in the array
 */
export const lumpVotes = (votes: Vote[]) =>
  votes.reduce((lumpedVotes: Vote[], currentVote: Vote) => {
    const previousVote = lumpedVotes[lumpedVotes.length - 1];

    if (previousVote && previousVote.voter === currentVote.voter) {
      previousVote.votingPower = String(
        Number(previousVote.votingPower) + Number(currentVote.votingPower),
      );
    } else {
      lumpedVotes.push({ ...currentVote });
    }

    return lumpedVotes;
  }, []);
