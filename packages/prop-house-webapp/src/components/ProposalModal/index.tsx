import { useEffect, useRef, useState } from 'react';
import classes from './ProposalModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import ProposalHeaderAndBody from '../ProposalHeaderAndBody/ProposalHeaderAndBody';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import {
  Direction,
  SignatureState,
  StoredProposalWithVotes,
  Vote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import { buildRoundPath } from '../../utils/buildRoundPath';
import {
  setActiveCommunity,
  setActiveProposal,
  setActiveProposals,
  setActiveRound,
} from '../../state/slices/propHouse';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import LoadingIndicator from '../LoadingIndicator';
import NotFound from '../NotFound';
import ProposalModalFooter from '../ProposalModalFooter';
import { votesRemaining } from '../../utils/votesRemaining';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import ErrorModal from '../ErrorModal';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessModal from '../SuccessModal';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { clearVoteAllotments } from '../../state/slices/voting';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';

const ProposalModal = () => {
  const [showProposalModal, setShowProposalModal] = useState(true);

  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const { account, library: provider } = useEthers();

  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  const [failedFetch, setFailedFetch] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<StoredProposalWithVotes | any>();
  const [currentPropIndex, setCurrentPropIndex] = useState<number>();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const [signerIsContract, setSignerIsContract] = useState(false);
  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);

  const [errorModalMessage, setErrorModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });
  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

  const [hideScrollButton, setHideScrollButton] = useState(false);

  useEffect(() => {
    setVotesLeftToAllot(votesRemaining(votingPower, submittedVotes, voteAllotments));
    setNumAllotedVotes(voteWeightForAllottedVotes(voteAllotments));
  }, [submittedVotes, voteAllotments, votingPower]);

  const handleClosePropModal = () => {
    if (!community || !round) return;
    setShowProposalModal(false);
    navigate(buildRoundPath(community, round), { replace: false });
  };

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id),
        )) as StoredProposalWithVotes;
        document.title = `${proposal.title}`;
        setCurrentProposal(proposal);

        dispatch(setActiveProposal(proposal));
      } catch (e) {
        setFailedFetch(true);
      }
    };

    fetch();

    return () => {
      document.title = 'Prop House';
    };
  }, [id, dispatch, failedFetch]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getAuction(proposal.auctionId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

  // fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      const proposals = await backendClient.current.getAuctionProposals(round.id);
      dispatch(setActiveProposals(proposals));

      dispatchSortProposals(dispatch, SortType.CreatedAt, false);

      currentProposal &&
        setCurrentPropIndex(
          proposals.findIndex((p: StoredProposalWithVotes) => p.id === currentProposal.id) + 1,
        );
    };

    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [currentProposal, dispatch, round]);

  // calculate if modal content is scrollable in order to show 'More' button
  const modal = document.querySelector('#propModal');
  useEffect(() => {
    if (modal) {
      modal.addEventListener(
        'scroll',
        function () {
          setHideScrollButton(true);
        },
        false,
      );
    }
  }, [modal]);

  const handleDirectionalArrowClick = (direction: Direction) => {
    if (
      proposals &&
      proposals.length > 0 &&
      currentProposal &&
      currentProposal.id &&
      direction &&
      proposals[
        proposals.findIndex((p: StoredProposalWithVotes) => p.id === currentProposal.id) + direction
      ].id
    ) {
      navigate(
        `${pathname.replace(
          /[^/]*$/,
          proposals[
            proposals.findIndex((p: StoredProposalWithVotes) => p.id === currentProposal.id) +
              direction
          ].id.toString(),
        )}`,
      );
    }
  };

  const _signerIsContract = async () => {
    if (!provider || !account) {
      return false;
    }
    const code = await provider?.getCode(account);
    const isContract = code !== '0x';
    setSignerIsContract(isContract);
    return isContract;
  };

  const handleSubmitVote = async () => {
    if (!provider) return;

    try {
      const blockHeight = await provider.getBlockNumber();

      const votes = voteAllotments

        .map(
          a =>
            new Vote(
              1,
              a.proposalId,
              a.votes,
              community!.contractAddress,
              SignatureState.PENDING_VALIDATION,
              blockHeight,
            ),
        )
        .filter(v => v.weight > 0);
      const isContract = await _signerIsContract();

      await backendClient.current.logVotes(votes, isContract);

      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessModal(true);
      refreshActiveProposals(backendClient.current, round!.id, dispatch);
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

  const winningIds = round && getWinningIds(proposals, round);

  return (
    <>
      {showVoteConfirmationModal && round && (
        <VoteConfirmationModal
          showNewModal={showVoteConfirmationModal}
          setShowNewModal={setShowVoteConfirmationModal}
          votingEndTime={round.votingEndTime}
          submitVote={handleSubmitVote}
          secondBtn
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          numPropsVotedFor={numPropsVotedFor}
          signerIsContract={signerIsContract}
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

      <Modal
        isOpen={showProposalModal}
        onRequestClose={() => handleClosePropModal()}
        className={clsx(classes.modal, 'proposalModalContainer')}
        id="propModal"
      >
        {proposal && proposals && proposals.length > 0 && currentPropIndex && currentProposal ? (
          <>
            <ProposalHeaderAndBody
              currentProposal={currentProposal}
              currentPropIndex={currentPropIndex}
              handleDirectionalArrowClick={handleDirectionalArrowClick}
              handleClosePropModal={handleClosePropModal}
              isWinner={winningIds && isWinner(winningIds, proposal.id)}
              hideScrollButton={hideScrollButton}
              setHideScrollButton={setHideScrollButton}
            />

            <ProposalModalFooter
              votingPower={votingPower}
              voteAllotments={voteAllotments}
              votesLeftToAllot={votesLeftToAllot}
              submittedVotes={submittedVotes}
              numAllotedVotes={numAllotedVotes}
              setShowVotingModal={setShowVoteConfirmationModal}
              propIndex={currentPropIndex}
              numberOfProps={proposals.length}
              handleDirectionalArrowClick={handleDirectionalArrowClick}
            />
          </>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}
      </Modal>
    </>
  );
};

export default ProposalModal;
