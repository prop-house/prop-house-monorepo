import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteAllotmentModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import removeZeroVotesAndSortByVotes from '../../utils/removeZeroVotesAndSortByVotes';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { openInNewTab } from '../../utils/openInNewTab';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveProposal } from '../../state/slices/propHouse';

const VoteAllotmentModal: React.FC<{
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { showModal, setShowModal } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const params = useParams();
  const { id } = params;

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);

  const voteAllotmentsForTooltip = removeZeroVotesAndSortByVotes(voteAllotments).map((v, idx) => (
    <div key={idx} className={classes.votesRow}>
      <div className={classes.voteRowTitle}>
        <span className={classes.votesAndTitle}>
          <span className={classes.propVotes}>
            {v.votes} {v.votes === 1 ? 'vote' : 'votes'} for{' '}
          </span>
          <span className={classes.propTitle}>{v.proposalTitle}</span>
        </span>

        {round && community && (
          <button
            disabled={v.proposalId === Number(id)}
            className={classes.verifyVoteBtn}
            onClick={e => {
              if (cmdPlusClicked(e)) {
                openInNewTab(`${buildRoundPath(community, round)}/${v.proposalId}`);
                setShowModal(false);
                return;
              }

              const p = proposals && proposals.find(p => p.id === v.proposalId);
              p && dispatch(setActiveProposal(p));
              setShowModal(false);
            }}
          >
            <FaLink />
          </button>
        )}
      </div>
    </div>
  ));

  const noVotesAllotted = (
    <div className={classes.container}>
      <div className={classes.imgContainer}>
        <img src="/heads/blackhole.png" alt="blackhole" />
      </div>

      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>{'No votes allotted'}</p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={() => setShowModal(false)}
      className={clsx(classes.modal)}
    >
      <div className={classes.votesContainer}>
        {voteAllotmentsForTooltip.length > 0 ? voteAllotmentsForTooltip : noVotesAllotted}
      </div>

      <div className={classes.buttonContainer}>
        <Button
          text={t('close')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default VoteAllotmentModal;
