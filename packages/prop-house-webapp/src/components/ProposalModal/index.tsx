import { useCallback, useEffect, useState } from 'react';
import classes from './ProposalModal.module.css';
import clsx from 'clsx';
import ReactModal from 'react-modal';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { setOnchainActiveProposal, setModalActive } from '../../state/slices/propHouse';
import ProposalHeaderAndBody from '../ProposalHeaderAndBody';
import ProposalModalFooter from '../ProposalModalFooter';
import VoteConfirmationModal from '../VoteConfirmationModal';
import VoteAllotmentModal from '../VoteAllotmentModal';
import SaveProposalModal from '../SaveProposalModal';
import DeleteProposalModal from '../DeleteProposalModal';
import { Proposal } from '@prophouse/sdk-react';

const ProposalModal: React.FC<{ proposals: Proposal[] }> = props => {
  const { proposals } = props;

  const [editProposalMode, setEditProposalMode] = useState(false);

  const params = useParams();
  const { id } = params;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);

  const [propModalEl, setPropModalEl] = useState<Element | null>();
  const [currentPropIndex, setCurrentPropIndex] = useState<number | undefined>();

  // modals
  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showVoteAllotmentModal, setShowVoteAllotmentModal] = useState(false);
  const [showSavePropModal, setShowSavePropModal] = useState(false);
  const [showDeletePropModal, setShowDeletePropModal] = useState(false);
  const [hideScrollButton, setHideScrollButton] = useState(false);

  useEffect(() => {
    if (activeProposal) document.title = `${activeProposal.title}`;
    return () => {
      document.title = `Prop House`;
    };
  }, [activeProposal, dispatch]);

  useEffect(() => {
    if (!proposals || !activeProposal) return;

    const index = proposals.findIndex((p: Proposal) => p.id === activeProposal.id);
    setCurrentPropIndex(index + 1);
    dispatch(setOnchainActiveProposal(proposals[index]));
  }, [proposals, id, dispatch, activeProposal]);

  // eslint-disable-next-line
  useEffect(() => {
    setPropModalEl(document.querySelector('#propModal'));
  });

  const handleKeyPress = useCallback(event => {
    if (event.key === 'ArrowDown') {
      setHideScrollButton(true);
    }
  }, []);

  const handleScroll = useCallback(event => {
    setHideScrollButton(true);
  }, []);

  useEffect(() => {
    if (!propModalEl) return;
    if (propModalEl.scrollTop !== 0 && !hideScrollButton) setHideScrollButton(true);
    propModalEl.addEventListener('scroll', handleScroll, false);
  }, [handleScroll, hideScrollButton, propModalEl]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleDirectionalArrowClick = (direction: 1 | -1) => {
    if (
      !activeProposal ||
      !proposals ||
      proposals.length === 0 ||
      editProposalMode ||
      showDeletePropModal
    )
      return;

    const newPropIndex =
      proposals.findIndex((p: Proposal) => p.id === activeProposal.id) + direction;
    dispatch(setOnchainActiveProposal(proposals[newPropIndex]));
  };

  const handleClose = () => {
    setEditProposalMode(false);
    dispatch(setModalActive(false));
  };

  return (
    <>
      {showVoteConfirmationModal && round && (
        <VoteConfirmationModal
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
          round={round}
        />
      )}

      {showVoteAllotmentModal && activeProposal && (
        <VoteAllotmentModal propId={activeProposal.id} setShowModal={setShowVoteAllotmentModal} />
      )}

      {showSavePropModal && activeProposal && round && (
        <SaveProposalModal
          propId={activeProposal.id}
          setShowSavePropModal={setShowSavePropModal}
          setEditProposalMode={setEditProposalMode}
        />
      )}

      {showDeletePropModal && activeProposal && (
        <DeleteProposalModal
          id={activeProposal.id}
          setShowDeletePropModal={setShowDeletePropModal}
        />
      )}

      <ReactModal
        isOpen={true}
        onRequestClose={handleClose}
        className={clsx(classes.modal, 'proposalModalContainer')}
        id="propModal"
      >
        {currentPropIndex && activeProposal && (
          <>
            <ProposalHeaderAndBody
              currentProposal={activeProposal}
              currentPropIndex={currentPropIndex}
              handleDirectionalArrowClick={handleDirectionalArrowClick}
              hideScrollButton={hideScrollButton}
              setHideScrollButton={setHideScrollButton}
              showVoteAllotmentModal={showVoteAllotmentModal}
              editProposalMode={editProposalMode}
              setEditProposalMode={setEditProposalMode}
              proposals={proposals}
            />

            <ProposalModalFooter
              setShowVotingModal={setShowVoteConfirmationModal}
              showVoteAllotmentModal={showVoteAllotmentModal}
              setShowVoteAllotmentModal={setShowVoteAllotmentModal}
              propIndex={currentPropIndex}
              numberOfProps={proposals.length}
              handleDirectionalArrowClick={handleDirectionalArrowClick}
              editProposalMode={editProposalMode}
              setEditProposalMode={setEditProposalMode}
              setShowSavePropModal={setShowSavePropModal}
              setShowDeletePropModal={setShowDeletePropModal}
            />
          </>
        )}
      </ReactModal>
    </>
  );
};

export default ProposalModal;
