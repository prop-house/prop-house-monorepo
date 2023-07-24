import clsx from 'clsx';
import classes from './TimedRoundVotingModule.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { countVotesRemainingForTimedRound } from '../../utils/countVotesRemainingForTimedRound';
import { countTotalVotesAlloted } from '../../utils/countTotalVotesAlloted';
import Button, { ButtonColor } from '../Button';
import RoundModuleCard from '../RoundModuleCard';
import { countNumVotes } from '../../utils/countNumVotes';
import ConnectButton from '../ConnectButton';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

export interface TimedRoundVotingModuleProps {
  totalVotes: number | undefined;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}
const TimedRoundVotingModule: React.FC<TimedRoundVotingModuleProps> = (
  props: TimedRoundVotingModuleProps,
) => {
  const { totalVotes, setShowVotingModal } = props;
  const { address: account } = useAccount();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);
  const numVotesByUserInActiveRound = countNumVotes(votesByUserInActiveRound);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

  const { t } = useTranslation();

  useEffect(() => {
    setVotesLeftToAllot(
      countVotesRemainingForTimedRound(votingPower, votesByUserInActiveRound, voteAllotments),
    );
    setNumAllotedVotes(countTotalVotesAlloted(voteAllotments));
  }, [votesByUserInActiveRound, voteAllotments, votingPower]);

  const content = (
    <>
      {account ? (
        votingPower > 0 ? (
          <>
            <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
              <span>{t('castYourVotes')}</span>
              <span className={classes.totalVotes}>{`${
                votesLeftToAllot > 0
                  ? `${votingPower - numVotesByUserInActiveRound - numAllotedVotes} ${t('left')}`
                  : t('noVotesLeft')
              }`}</span>
            </h1>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                numVotesByUserInActiveRound > 0 &&
                  votingPower !== numVotesByUserInActiveRound &&
                  'roundAllotmentBar',
              )}
            >
              <ProgressBar
                variant="success"
                now={(numVotesByUserInActiveRound / votingPower) * 100}
              />

              <ProgressBar variant="warning" now={(numAllotedVotes / votingPower) * 100} key={2} />
            </ProgressBar>
          </>
        ) : (
          <p className={classes.subtitle}>
            <b>Your account does not have any votes in this round.</b>
          </p>
        )
      ) : (
        <p className={classes.sideCardBody}>
          <b>{t('proposers')}:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>{t('connectToViewPropStatus')}</p>
            </div>
          </div>

          <b>{t('voters')}:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>{t('connectToVoteOnProps')}</p>
            </div>
          </div>
        </p>
      )}
      {!account ? (
        <ConnectButton text={t('connectToVote')} color={ButtonColor.Pink} />
      ) : account && votingPower ? (
        <Button
          text={t('submitVotes')}
          bgColor={ButtonColor.Purple}
          onClick={() => setShowVotingModal(true)}
          disabled={
            countTotalVotesAlloted(voteAllotments) === 0 ||
            numVotesByUserInActiveRound === votingPower
          }
        />
      ) : null}
    </>
  );

  return (
    <RoundModuleCard
      title={t('votingInProgress')}
      subtitle={
        <>
          <span className={classes.purpleText}>{totalVotes}</span>{' '}
          {totalVotes === 1 ? t('vote') : t('votes')} {t('castSoFar')}!
        </>
      }
      content={content}
      type="voting"
    />
  );
};

export default TimedRoundVotingModule;
