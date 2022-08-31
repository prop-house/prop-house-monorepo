import ProposalCards from '../ProposalCards';
import {
  StoredAuction,
  StoredProposalWithVotes,
  Vote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { VoteAllotment, updateVoteAllotment } from '../../utils/voteAllotment';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import { setDelegatedVotes, setActiveProposals } from '../../state/slices/propHouse';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import { getNumVotes } from 'prop-house-communities';
import { useTranslation } from 'react-i18next';
import RoundMessage from '../RoundMessage';
import VotingModal from '../VotingModal';
import { findProposalById } from '../../utils/findProposalById';
import SuccessModal from '../SuccessModal';
import ErrorModal from '../ErrorModal';

const FullAuction: React.FC<{
  auction: StoredAuction;
  isFirstOrLastAuction: () => [boolean, boolean];
  handleAuctionChange: (next: boolean) => void;
}> = props => {
  const { auction } = props;

  const { account, library } = useEthers();
  const [voteAllotments, setVoteAllotments] = useState<VoteAllotment[]>([]);

  const [showVotingModal, setShowVotingModal] = useState(false);
  const [propsWithVotes, setPropsWithVotes] = useState<StoredProposalWithVotes[] | any>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });

  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  // aggregate vote weight of already stored votes
  const userVotesWeight = () => {
    if (!account || !proposals) return 0;
    return aggVoteWeightForProps(proposals, account);
  };

  // total votes allotted (these are pre-submitted votes)
  const numAllottedVotes = voteAllotments.reduce(
    (counter, allotment) => Number(counter) + Number(allotment.votes),
    0,
  );

  // check vote allotment against vote user is allowed to use
  const canAllotVotes = () => {
    if (!delegatedVotes) return false;
    return numAllottedVotes < delegatedVotes - userVotesWeight();
  };

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch votes/delegated votes allowed for user to use
  useEffect(() => {
    if (!account || !library || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(account, community.contractAddress, library);
        dispatch(setDelegatedVotes(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, library, dispatch, community]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));

      // default sorting method is random, unless the auction is over, in which case its by votes
      dispatchSortProposals(
        dispatch,
        auctionStatus(auction) === AuctionStatus.AuctionEnded ? SortType.Score : SortType.Random,
        false,
      );
    };
    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [auction.id, dispatch, account, auction]);

  // manage vote alloting
  const handleVoteAllotment = (proposalId: number, support: boolean) => {
    setVoteAllotments(prev => {
      // if no votes have been allotted yet, add new
      if (prev.length === 0) return [{ proposalId, votes: 1 }];

      const preexistingVoteAllotment = prev.find(allotment => allotment.proposalId === proposalId);

      // if not already alloted to specific proposal,  add new allotment
      if (!preexistingVoteAllotment) return [...prev, { proposalId, votes: 1 }];

      // if already allotted to a specific proposal, add one vote to allotment
      const updated = prev.map(a =>
        a.proposalId === preexistingVoteAllotment.proposalId ? updateVoteAllotment(a, support) : a,
      );

      return updated;
    });
  };

  const handleVote = async () => {
    if (!delegatedVotes || !community) return;

    const votesForProps =
      proposals &&
      voteAllotments.sort((a, b) => a.proposalId - b.proposalId).filter(a => a.votes > 0);

    let propsWithVotes: any[] = [];

    proposals &&
      votesForProps &&
      votesForProps.map(p =>
        propsWithVotes.push({
          id: p.proposalId,
          title: findProposalById(p.proposalId, proposals)?.title,
          votes: p.votes,
        }),
      );

    setShowVotingModal(true);

    try {
      setPropsWithVotes(propsWithVotes.sort((a, b) => b.votes - a.votes));
    } catch (e) {
      console.log('e up', e);

      setErrorModalMessage({
        title: 'oops, sorry',
        message: 'We failed to process your votes. Please try again.',
        image: 'whale.png',
      });
      setShowErrorModal(true);
    }
  };
  const submitVote = async () => {
    try {
      const votes = voteAllotments
        .map(a => new Vote(1, a.proposalId, a.votes, community!.contractAddress))
        .filter(v => v.weight > 0);

      await client.current.logVotes(votes);

      setShowSuccessModal(true);

      refreshActiveProposals(client.current, auction.id, dispatch);
      setVoteAllotments([]);
      setShowVotingModal(false);
    } catch (e) {
      console.log('e', e);

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
      {showSuccessModal && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          numOfProps={propsWithVotes.length}
        />
      )}

      {showVotingModal && (
        <VotingModal
          showNewModal={showVotingModal}
          setShowNewModal={setShowVotingModal}
          propsWithVotes={propsWithVotes}
          votesLeft={
            delegatedVotes && delegatedVotes - (userVotesWeight() ?? 0) - (numAllottedVotes ?? 0)
          }
          votingEndTime={auction.votingEndTime}
          submitVote={submitVote}
          secondBtn
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
      ) : auction.proposals.length === 0 ? (
        <RoundMessage message={t('submittedProps')} />
      ) : (
        <>
          {community && (
            <ProposalCards
              auction={auction}
              community={community}
              voteAllotments={voteAllotments}
              canAllotVotes={canAllotVotes}
              numAllottedVotes={numAllottedVotes}
              submittedVotesCount={userVotesWeight()}
              handleVote={handleVote}
              handleVoteAllotment={handleVoteAllotment}
              votesLeft={delegatedVotes && delegatedVotes - numAllottedVotes}
            />
          )}
        </>
      )}
    </>
  );
};

export default FullAuction;
