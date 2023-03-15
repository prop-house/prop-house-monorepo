import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import classes from './VotingModule.module.css';
import { useTranslation } from 'react-i18next';
import { useAccount, useProvider } from 'wagmi';
import trimEthAddress from '../../utils/trimEthAddress';
import { getName } from 'prop-house-communities';

export interface VotingModuleProps {
  totalVotes: number | undefined;
}
const VotingModule: React.FC<VotingModuleProps> = (props: VotingModuleProps) => {
  const { totalVotes } = props;
  const { address: account } = useAccount();
  const provider = useProvider();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);
  const [tokenName, setTokenName] = useState<string>('');

  const { t } = useTranslation();

  useEffect(() => {
    setVotesLeftToAllot(votesRemaining(votingPower, submittedVotes, voteAllotments));
    setNumAllotedVotes(voteWeightForAllottedVotes(voteAllotments));
  }, [submittedVotes, voteAllotments, votingPower]);

  useEffect(() => {
    if (!community) return;

    const fetchTokenName = async () => {
      let name;
      const trimmedAddress = trimEthAddress(community.contractAddress);
      try {
        name = await getName(community.contractAddress, provider);
        setTokenName(name ? name : trimmedAddress);
      } catch (e) {
        console.log('error fetching name: ', e);
        setTokenName(trimmedAddress);
      }
    };
    fetchTokenName();
  }, [community, provider]);

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
              {t('youDontHaveAny')}
              {` ${tokenName} tokens`} {t('requiredToVote')}.
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
