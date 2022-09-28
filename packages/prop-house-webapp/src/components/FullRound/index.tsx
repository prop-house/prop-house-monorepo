import { StoredAuction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import { setActiveProposals } from '../../state/slices/propHouse';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import { getNumVotes } from 'prop-house-communities';
import RoundMessage from '../RoundMessage';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessModal from '../SuccessModal';
import ErrorModal from '../ErrorModal';
import PropCardsAndModules from '../PropCardsAndModules';
import {
  clearVoteAllotments,
  setNumSubmittedVotes,
  setVotingPower,
} from '../../state/slices/voting';

const FullRound: React.FC<{
  auction: StoredAuction;
}> = props => {
  const { auction } = props;
  const { account, library } = useEthers();

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });

  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));

      // default sorting method is random, unless the auction is over, in which case its by votes
      dispatchSortProposals(
        dispatch,
        auctionStatus(auction) === AuctionStatus.AuctionEnded
          ? SortType.VoteCount
          : SortType.Random,
        false,
      );
    };
    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [auction.id, dispatch, account, auction]);

  // fetch voting power for user
  useEffect(() => {
    if (!account || !library || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          library,
          auction.balanceBlockTag,
        );
        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, library, dispatch, community, auction.balanceBlockTag]);

  // update submitted votes on proposal changes
  useEffect(() => {
    if (proposals && account)
      dispatch(setNumSubmittedVotes(aggVoteWeightForProps(proposals, account)));
  }, [proposals, account, dispatch]);

  const handleSubmitVote = async () => {
    try {
      const votes = voteAllotments
        .map(a => new Vote(1, a.proposalId, a.votes, community!.contractAddress))
        .filter(v => v.weight > 0);

      await client.current.logVotes(votes);

      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessModal(true);
      refreshActiveProposals(client.current, auction.id, dispatch);
      dispatch(clearVoteAllotments());
      setShowVoteConfirmationModal(false);
    } catch (e) {
      setErrorModalMessage({
        title: 'Failed to submit votes',
        message: 'Please go back and try again.',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }
  };

  return (
    <>
      {showVoteConfirmationModal && (
        <VoteConfirmationModal
          showNewModal={showVoteConfirmationModal}
          setShowNewModal={setShowVoteConfirmationModal}
          votingEndTime={auction.votingEndTime}
          submitVote={handleSubmitVote}
          secondBtn
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          numPropsVotedFor={numPropsVotedFor}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          showErrorModal={showErrorModal}
          setShowErrorModal={setShowErrorModal}
          title={errorModalMessage.title}
          message={errorModalMessage.message}
          image={errorModalMessage.image}
        />
      )}

      {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
        <RoundMessage message="Funding round starting soon" date={auction.startTime} />
      ) : (
        <>
          {community && (
            <PropCardsAndModules
              auction={auction}
              community={community}
              setShowVotingModal={setShowVoteConfirmationModal}
            />
          )}
        </>
      )}
    </>
  );
};

export default FullRound;
