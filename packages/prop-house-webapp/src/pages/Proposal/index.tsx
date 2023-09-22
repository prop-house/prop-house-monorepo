import classes from './Proposal.module.css';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import NotFound from '../../components/NotFound';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setOnchainActiveProposal, setOnchainActiveRound } from '../../state/slices/propHouse';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Container } from 'react-bootstrap';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import { useAccount } from 'wagmi';
import ProposalModalVotingModule from '../../components/ProposalModalVotingModule';
import { ButtonColor } from '../../components/Button';
import ConnectButton from '../../components/ConnectButton';
import { useTranslation } from 'react-i18next';
import { useAccountModal } from '@rainbow-me/rainbowkit';
import useVotingPower from '../../hooks/useVotingPower';
import VoteConfirmationModal from '../../components/VoteConfirmationModal';
import ErrorVotingModal from '../../components/ErrorVotingModal';
import SuccessVotingModal from '../../components/SuccessVotingModal';
import { RoundState, usePropHouse } from '@prophouse/sdk-react';

const Proposal = () => {
  const params = useParams();
  const { round: roundAddress, id } = params;

  const navigate = useNavigate();
  const { address: account, isConnected } = useAccount();
  const { t } = useTranslation();
  const { openAccountModal } = useAccountModal();

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.onchainActiveProposal);
  const round = useAppSelector(state => state.propHouse.onchainActiveRound);

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);

  const [failedFetch, setFailedFetch] = useState(false);
  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [isContract, setIsContract] = useState(false);

  const [loadingVotingPower, errorLoadingVotingPower, votingPower] = useVotingPower(round, account);

  const propHouse = usePropHouse();

  // fetch prop, round and house
  useEffect(() => {
    if (!roundAddress || !id || proposal) return;
    const fetchProposal = async () => {
      try {
        // TODO: uncomment once query.getProposal is fixed
        // const proposal = await propHouse.query.getProposal(roundAddress, Number(id));
        const proposals = await propHouse.query.getProposalsForRound(roundAddress);
        const proposal = proposals[0];
        const round = await propHouse.query.getRound(roundAddress);

        document.title = `${proposal.title}`;
        dispatch(setOnchainActiveProposal(proposal));
        dispatch(setOnchainActiveRound(round));
      } catch (e) {
        setFailedFetch(true);
        console.log('Error fetching prop: ', e);
      }
    };
    fetchProposal();

    return () => {
      document.title = 'Prop House';
    };
  });

  const handleBackClick = () => {
    if (!round) return;
    navigate(`/${round.address}`, { replace: false });
  };

  const handleSubmitVote = async () => {};

  const votingBar = proposal && round && round.state === RoundState.IN_VOTING_PERIOD && (
    <div className={classes.votingBar}>
      {isConnected ? (
        loadingVotingPower ? (
          <div className={classes.loadingVoting}>
            <LoadingIndicator height={50} width={50} />
          </div>
        ) : votingPower && votingPower > 0 ? (
          <ProposalModalVotingModule
            proposal={proposal!}
            setShowVotingModal={setShowVoteConfirmationModal}
          />
        ) : (
          <div className={classes.votingBarContent}>
            <b>Wallet is ineligible to vote.</b>
            <div>
              Trying with the wrong wallet? You can connect another wallet{' '}
              <span className={classes.inlineClick} onClick={openAccountModal}>
                here →
              </span>
            </div>
          </div>
        )
      ) : (
        <div className={classes.votingBarContent}>
          <div>
            <b>Voting has started.</b> Connect a wallet to determine your voting eligibility.
          </div>
          <ConnectButton text={t('connectToVote')} color={ButtonColor.Purple} />{' '}
        </div>
      )}
    </div>
  );

  return (
    <Container>
      {showVoteConfirmationModal && round && (
        <VoteConfirmationModal
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
          submitVote={handleSubmitVote}
        />
      )}

      {showSuccessVotingModal && (
        <SuccessVotingModal
          setShowSuccessVotingModal={setShowSuccessVotingModal}
          numPropsVotedFor={numPropsVotedFor}
          signerIsContract={isContract}
        />
      )}

      {showErrorVotingModal && (
        <ErrorVotingModal setShowErrorVotingModal={setShowErrorVotingModal} />
      )}

      {proposal && (
        <OpenGraphElements
          title={proposal.title}
          description={proposal.body.substring(0, 120)}
          imageUrl={cardServiceUrl(CardType.proposal, String(proposal.id)).href}
        />
      )}

      {proposal ? (
        <RenderedProposalFields
          proposal={proposal}
          backButton={
            <div className={classes.backToAuction} onClick={() => handleBackClick()}>
              <IoArrowBackCircleOutline size={'1.5rem'} /> View round{' '}
              {round ? `(${round.title})` : ''}
            </div>
          }
        />
      ) : failedFetch ? (
        <NotFound />
      ) : (
        <LoadingIndicator />
      )}
      {votingBar}
      <div className={classes.gradient} />
    </Container>
  );
};

export default Proposal;
