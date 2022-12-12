import clsx from 'clsx';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';

import classes from './VotingModule.module.css';
import { useTranslation } from 'react-i18next';

export interface VotingModuleProps {
  communityName: string;
  totalVotes: number | undefined;
}
const VotingModule: React.FC<VotingModuleProps> = (props: VotingModuleProps) => {
  const { communityName, totalVotes } = props;
  const { account } = useEthers();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

  const { t } = useTranslation();

  useEffect(() => {
    setVotesLeftToAllot(votesRemaining(votingPower, submittedVotes, voteAllotments));
    setNumAllotedVotes(voteWeightForAllottedVotes(voteAllotments));
  }, [submittedVotes, voteAllotments, votingPower]);

  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.purpleIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>{t('votingInProgress')}</p>
          <p className={classes.subtitle}>
            <span className={classes.purpleText}>{totalVotes}</span>{' '}
            {totalVotes === 1 ? t('vote') : t('votes')} {t('castSoFar')}!
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      {account ? (
        votingPower > 0 ? (
          <>
            <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
              <span>{t('castYourVotes')}</span>

              <span className={classes.totalVotes}>{`${
                votesLeftToAllot > 0
                  ? `${votingPower - submittedVotes - numAllotedVotes} ${t('left')}`
                  : t('noVotesLeft')
              }`}</span>
            </h1>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                submittedVotes > 0 && votingPower !== submittedVotes && 'roundAllotmentBar',
              )}
            >
              <ProgressBar variant="success" now={(submittedVotes / votingPower) * 100} />

              <ProgressBar variant="warning" now={(numAllotedVotes / votingPower) * 100} key={2} />
            </ProgressBar>
          </>
        ) : (
          <p className={classes.subtitle}>
            <b>
              {t('youDontHaveAny')} {communityName} {t('requiredToVote')}.
            </b>
          </p>
        )
      ) : (
        <p className={classes.sideCardBody}>
          <b>{t('proposers')}:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>{t('connectToViewPropStatus')}.</p>
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
    </>
  );
};

export default VotingModule;
