import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteConfirmationModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { countVotesRemainingForTimedRound } from '../../utils/countVotesRemainingForTimedRound';
import { VoteAllotment } from '../../types/VoteAllotment';
import { useTranslation } from 'react-i18next';
import sortVoteAllotmentsByVotes from '../../utils/sortVoteAllotmentsByVotes';
import Modal from '../Modal';
import { isTimedAuction } from '../../utils/auctionType';

const VoteConfirmationModal: React.FC<{
  setShowVoteConfirmationModal: Dispatch<SetStateAction<boolean>>;
  submitVote: () => Promise<void>;
}> = props => {
  const { setShowVoteConfirmationModal, submitVote } = props;

  const round = useAppSelector(state => state.propHouse.activeRound);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);
  const votesLeft = countVotesRemainingForTimedRound(
    votingPower,
    votesByUserInActiveRound,
    voteAllotments,
  );
  const { t } = useTranslation();

  const totalVotesBeingSubmitted = voteAllotments.reduce(
    (total, prop) => (total = total + prop.votes),
    0,
  );

  const sortedVoteAllottments = sortVoteAllotmentsByVotes(voteAllotments);

  return (
    <Modal
      setShowModal={setShowVoteConfirmationModal}
      title={
        <>
          {' '}
          {t('cast')} {totalVotesBeingSubmitted} {totalVotesBeingSubmitted === 1 ? 'vote' : 'votes'}
        </>
      }
      subtitle={
        round && isTimedAuction(round) ? (
          <>
            {t('youllHave')} {votesLeft} {t('votesRemaining')}
          </>
        ) : (
          ''
        )
      }
      body={
        <div className={classes.propsContainer}>
          <div className={classes.props}>
            {sortedVoteAllottments.map((prop: VoteAllotment) => (
              <div key={prop.proposalId} className={classes.propCopy}>
                <p className={classes.voteCount}>{prop.votes}</p>
                <hr className={classes.line} />
                <p className={classes.propTitle}>{prop.proposalTitle}</p>
              </div>
            ))}
          </div>
        </div>
      }
      button={
        <Button
          text={t('nope')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowVoteConfirmationModal(false);
          }}
        />
      }
      secondButton={
        <Button text={t('signAndSubmit')} bgColor={ButtonColor.Purple} onClick={submitVote} />
      }
    />
  );
};

export default VoteConfirmationModal;
