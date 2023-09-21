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
import { useAppSelector } from '../../hooks';
import LoadingIndicator from '../LoadingIndicator';
import { BsPersonFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Round, RoundState, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';

const TimedRoundAcceptingPropsModule: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const prophouse = usePropHouse();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const [loadingCanPropose, setLoadingCanPropose] = useState<boolean>(false);
  const [canPropose, setCanPropose] = useState<boolean | null | undefined>(undefined);

  const isProposingWindow = round.state === RoundState.IN_PROPOSING_PERIOD;

  useEffect(() => {
    if (canPropose !== undefined) return;

    const fetchVotingPower = async () => {
      setLoadingCanPropose(true);
      try {
        const votingPower = await prophouse.voting.getTotalVotingPower(
          account as string,
          round.config.proposalPeriodStartTimestamp,
          round.votingStrategies,
        );
        setCanPropose(votingPower.toNumber() > 0);
      } catch (e) {
        console.log('error fetching voting power: ', e);
        setCanPropose(false);
      }
      setLoadingCanPropose(false);
    };
    fetchVotingPower();
  });

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'proposingCopy'} />
          </p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'votingCopy'} />
          </p>
        </div>
      </div>
      {account ? (
        <Button
          text={
            loadingCanPropose ? (
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
            // navigate('/create', { state: { auction, community, proposals } });
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
