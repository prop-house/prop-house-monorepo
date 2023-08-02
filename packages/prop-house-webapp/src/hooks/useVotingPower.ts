import { useEffect, useState } from 'react';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { useProvider } from 'wagmi';
import { execStrategy } from '@prophouse/communities';
import { AuctionStatus, auctionStatus } from '../utils/auctionStatus';

export type UseVotingPowerResults = [
  /**
   * loadingCanVote
   */
  boolean,
  /**
   * votingPower
   */
  number | null,
  /**
   * number of votes cast
   */
  number | undefined | null,
  /**
   * Voting Copy
   */
  string,
  /**
   * Refresh voting power
   */
  Refresh,
  /**
   * Refresh user grants
   */
  Refresh,
];

const defaultVotingCopy =
  "Accounts that meet the round's voting requirements can vote for their favorite props.";

type Refresh = () => Promise<void>;
const useVotingPower = (
  round: StoredAuctionBase,
  account: `0x${string}` | undefined,
  community: Community | undefined,
): UseVotingPowerResults => {
  const [loadingCanVote, setLoadingCanVote] = useState(false);
  const [votingPower, setVotingPower] = useState<null | number>(null);

  const [numVotesCasted, setNumVotesCasted] = useState<number | undefined | null>(undefined);
  const [votingCopy] = useState(round.voteStrategyDescription ?? defaultVotingCopy);

  const provider = useProvider({
    chainId: round.voteStrategy.chainId ? round.voteStrategy.chainId : 1,
  });

  const fetchVotingPower = async () => {
    if (!(auctionStatus(round) === AuctionStatus.AuctionVoting) || !community) return;

    if (!account) {
      setVotingPower(null);
      setNumVotesCasted(null);
      return;
    }
    setLoadingCanVote(true);
    const params = {
      strategyName: round.voteStrategy.strategyName,
      account,
      provider,
      ...round.voteStrategy,
    };

    try {
      setVotingPower(await execStrategy(params));
    } catch (e) {
      console.log(e);
    }
    setLoadingCanVote(false);
  };

  const fetchUserGrants = async () => {
    await fetchVotingPower();
  };

  useEffect(() => {
    fetchUserGrants();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, account, community]);

  return [
    loadingCanVote,
    votingPower,
    numVotesCasted,
    votingCopy,
    fetchVotingPower,
    fetchUserGrants,
  ];
};

export default useVotingPower;
