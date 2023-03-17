import clsx from 'clsx';
import classes from './InfRoundVotingModule.module.css';
import { Dispatch, SetStateAction } from 'react';
import { useAppSelector } from '../../hooks';
import { countTotalVotesAlloted } from '../../utils/countTotalVotesAlloted';
import Button, { ButtonColor } from '../Button';
import RoundModuleCard from '../RoundModuleCard';
import { countNumVotes } from '../../utils/countNumVotes';
import ConnectButton from '../ConnectButton';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

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
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);
  const numVotesByUserInActiveRound = countNumVotes(votesByUserInActiveRound);

  const { t } = useTranslation();

  const title = 'Voting in progress';
  const subtitle = !account
    ? 'Props meeting quorum will be awarded'
    : account && votingPower > 0
    ? 'You have 100 votes per prop'
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
            <span>{voteAllotments.length > 0 ? 'Votes' : 'Allot your votes:'}</span>
          </h1>

          <div className={classes.bulletList}>
            {voteAllotments.length === 0 ? (
              <>
                <div className={classes.bulletItem}>
                  <hr className={classes.bullet} />
                  No votes yet
                </div>
              </>
            ) : (
              voteAllotments.map(v => (
                <>
                  <div className={classes.bulletItem}>
                    <hr className={classes.bullet} />
                    <div className={classes.vote}>
                      {v.votes} vote{v.votes > 1 ? 's' : ''} for {v.proposalTitle}
                    </div>
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
          disabled={
            countTotalVotesAlloted(voteAllotments) === 0 ||
            numVotesByUserInActiveRound === votingPower
          }
        />
      ) : null}
    </>
  );

  return <RoundModuleCard title={title} subtitle={subtitle} content={content} type="voting" />;
};

export default InfRoundVotingModule;
