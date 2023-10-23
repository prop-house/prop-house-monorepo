import classes from './TimedRoundAcceptingPropsModule.module.css';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import LoadingIndicator from '../LoadingIndicator';
import { Round } from '@prophouse/sdk-react';
import useCanPropose from '../../hooks/useCanPropose';
import ProposingStrategiesDisplay from '../ProposingStrategiesDisplay';
import VotingStrategiesDisplay from '../VotingStrategiesDisplay';

const TimedRoundAcceptingPropsModule: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const [loadingCanPropose, errorLoadingCanPropose, canPropose] = useCanPropose(round, account);

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <ProposingStrategiesDisplay
            proposingStrategies={round.proposingStrategies}
            propThreshold={round.config.proposalThreshold}
          />
        </div>

        <div className={classes.listItem}>
          <VotingStrategiesDisplay votingStrategies={round.votingStrategies} />
        </div>
      </div>
      {account ? (
        <Button
          text={
            errorLoadingCanPropose ? (
              <>Error loading account requirements</>
            ) : loadingCanPropose ? (
              <div className={classes.loadingCopy}>
                Verifying account requirements
                <LoadingIndicator height={30} width={30} />
              </div>
            ) : canPropose && !loadingCanPropose ? (
              'Create your proposal'
            ) : (
              'Wallet is ineligible to propose'
            )
          }
          bgColor={loadingCanPropose || !canPropose ? ButtonColor.Gray : ButtonColor.Green}
          onClick={() => {
            dispatch(clearProposal());
            navigate('/create');
          }}
          disabled={!canPropose}
        />
      ) : (
        <ConnectButton color={ButtonColor.Pink} />
      )}
    </>
  );

  return (
    <RoundModuleCard
      title={t('acceptingProposals')}
      subtitle={<>{`Until ${dayjs(round.config.proposalPeriodEndTimestamp).format('MMMM D')}`}</>}
      content={content}
      type="proposing"
    />
  );
};

export default TimedRoundAcceptingPropsModule;
