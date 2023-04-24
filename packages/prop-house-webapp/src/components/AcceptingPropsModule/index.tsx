import classes from './AcceptingPropsModule.module.css';
// import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../hooks';
import { House, Round, RoundState } from '@prophouse/sdk-react';

const AcceptingPropsModule: React.FC<{
  round: Round
  community: House;
}> = props => {
  const { round, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = round.state === RoundState.IN_PROPOSING_PERIOD;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const content = (
    <>
      <b>{t('howProposingWorks')}:</b>
      <div className={classes.bulletList}>
        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>{t('anyoneCanSubmit')}.</p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>
            {t('ownersOfThe')} <b>{community.name}</b> {t('tokenWillVote')}.
          </p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>
            {isInfAuction(round) ? (
              'Proposals that meet quorum will get funded.'
            ) : (
              <>
                {' '}
                {t('theTop')} <b>{round.config.winnerCount}</b>{' '}
                {round.config.winnerCount === 1 ? 'proposal' : 'proposals'} {t('willGetFunded')}{' '}
                {/* Needs more complex UI */}
                {/* <b>
                  {round.fundingAmount} {round.currencyType}{' '}
                </b>
                {t('each')}. */}
              </>
            )}
          </p>
        </div>
      </div>

      {isProposingWindow &&
        (account ? (
          <Button
            text={t('createYourProposal')}
            bgColor={ButtonColor.Green}
            onClick={() => {
              dispatch(clearProposal());
              navigate('/create', { state: { round, community, proposals } });
            }}
          />
        ) : (
          <ConnectButton color={ButtonColor.Pink} />
        ))}
    </>
  );

  return (
    <RoundModuleCard
      title={t('acceptingProposals')}
      subtitle={
        <>
          Until{' '}
          {isInfAuction(round)
            ? 'funding is depleted'
            : dayjs.unix(round.config.proposalPeriodEndTimestamp).format('MMMM D')}
        </>
      }
      content={content}
      type="proposing"
    />
  );
};

export default AcceptingPropsModule;
