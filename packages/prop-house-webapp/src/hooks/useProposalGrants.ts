import { useEffect, useState } from 'react';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { usePublicClient } from 'wagmi';
import { execStrategy } from '@prophouse/communities';

export type UseUserGrantsResults = [
  /**
   * loadingCanPropose
   */
  boolean,
  /**
   * canPropose
   */
  boolean | null,
  /**
   * Proposing Copy
   */
  string,
  /**
   * Voting Copy
   */
  string,
  /**
   * Refresh user grants
   */
  Refresh,
];

const defaultProposingCopy =
  "Accounts that meet the round's proposing requirements can submit a proposal.";
const defaultVotingCopy =
  "Accounts that meet the round's voting requirements can vote for their favorite props.";

type Refresh = () => Promise<void>;
const useProposalGrants = (
  auction: StoredAuctionBase,
  account: `0x${string}` | undefined,
): UseUserGrantsResults => {
  const [loadingCanPropose, setLoadingCanPropose] = useState(false);
  const [canPropose, setCanPropose] = useState<null | boolean>(null);

  const [proposingCopy] = useState(auction.propStrategyDescription ?? defaultProposingCopy);
  const [votingCopy] = useState(auction.voteStrategyDescription ?? defaultVotingCopy);

  const publicClient = usePublicClient({
    chainId: auction.propStrategy.chainId,
  });

  const fetchUserCanPropose = async () => {
    setLoadingCanPropose(true);
    const params = {
      strategyName: auction.propStrategy.strategyName,
      account,
      publicClient,
      ...auction.propStrategy,
    };

    try {
      setCanPropose((await execStrategy(params)) > 0);
    } catch (e) {
      console.log(e);
    }
    setLoadingCanPropose(false);
  };

  const fetchUserGrants = async () => {
    await fetchUserCanPropose();
  };

  useEffect(() => {
    fetchUserGrants();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction, account]);

  return [loadingCanPropose, canPropose, proposingCopy, votingCopy, fetchUserGrants];
};

export default useProposalGrants;
