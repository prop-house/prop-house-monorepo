import clsx from 'clsx';
import classes from './InfRoundVotingModule.module.css';
import { Dispatch, SetStateAction } from 'react';
import { useAppSelector } from '../../hooks';
import { countTotalVotesAlloted } from '../../utils/countTotalVotesAlloted';
import Button, { ButtonColor } from '../Button';
import RoundModuleCard from '../RoundModuleCard';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import ConnectButton from '../ConnectButton';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';

export interface InfRoundVotingModuleProps {
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}
const InfRoundVotingModule: React.FC<InfRoundVotingModuleProps> = (
  props: InfRoundVotingModuleProps,
) => {
  const { setShowVotingModal } = props;
  const { address: account } = useAccount();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);

  const { t } = useTranslation();

  const title = 'Voting in progress';
  const subtitle = !account
    ? 'Props meeting quorum will be awarded'
    : account && votingPower > 0
    ? `You have ${votingPower} vote${votingPower > 1 ? 's' : ''} per prop`
    : '';

  const content = (
    <>
      {!account ? (
        <>
          <b>{t('voters')}:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>{t('connectToVoteOnProps')}</p>
            </div>
          </div>
        </>
      ) : votingPower > 0 ? (
        <>
          <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
            <span>{voteAllotments.length > 0 ? 'Your votes' : 'Allot your votes:'}</span>
          </h1>

          <div className={classes.bulletList}>
            {voteAllotments.length === 0 ? (
              <>
                <div className={classes.bulletItem}>No votes yet</div>
              </>
            ) : (
              voteAllotments.map(v => (
                <>
                  <div className={classes.vote}>
                    {v.direction === Direction.Up ? (
                      <FiThumbsUp className={classes.thumbsUp} />
                    ) : (
                      <FiThumbsDown className={classes.thumbsDown} />
                    )}
                    {v.proposalTitle}
                  </div>
                </>
              ))
            )}
          </div>
        </>
      ) : (
        ''
      )}
      {!account ? (
        <ConnectButton text={t('connectToVote')} color={ButtonColor.Pink} />
      ) : account && votingPower ? (
        <Button
          text={t('submitVotes')}
          bgColor={ButtonColor.Purple}
          onClick={() => setShowVotingModal(true)}
          disabled={countTotalVotesAlloted(voteAllotments) === 0}
        />
      ) : null}
    </>
  );

  return <RoundModuleCard title={title} subtitle={subtitle} content={content} type="voting" />;
};

export default InfRoundVotingModule;
