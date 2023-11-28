import { Proposal, Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import classes from './ProposalCardClaimAwardBar.module.css';
import { FaClock, FaTrophy, FaCheck } from 'react-icons/fa6';
import { HiEmojiSad } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import LoadingIndicator from '../LoadingIndicator';
import { useAccount } from 'wagmi';
import { FaCheckCircle } from 'react-icons/fa';

const ProposalCardClaimAwardBar: React.FC<{ round: Round; proposal: Proposal }> = props => {
  const { round, proposal } = props;

  const propHouse = usePropHouse();
  const { address: account } = useAccount();
  const [countdown, setCountdown] = useState(
    round.config.votePeriodEndTimestamp + 21600 - Date.now() / 1000,
  );
  const [txState, setTxState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [claimed, setClaimed] = useState<boolean>();

  useEffect(() => {
    if (!account) return;
    const fetchClaims = async () => {
      try {
        const claims = await propHouse.query.getRoundClaimsByAccount(account);
        setClaimed(
          claims.some(
            claim =>
              Number(claim.proposalId) === Number(proposal.id) && claim.round === round.address,
          ),
        );
      } catch (e) {
        console.log(e);
      }
    };
    fetchClaims();
  });

  const inClaimPeriod = round.state === Timed.RoundState.IN_CLAIMING_PERIOD;
  const passedSixHoursAfterRoundEnd =
    Date.now() / 1000 > round.config.votePeriodEndTimestamp + 21600;

  const hours = Math.floor(countdown / 3600);
  const minutes = Math.floor((countdown % 3600) / 60);

  useEffect(() => {
    if (claimed) return;
    const interval = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [claimed]);

  const claim = async () => {
    try {
      setTxState('loading');
      const result = await propHouse.round.timed.claimAward({
        round: round.address,
        proposalId: proposal.id,
      });
      await result.wait();
      setTxState('success');
    } catch (e) {
      console.log(e);
      setTxState('error');
    }
  };

  const inClaimPeriodContent =
    txState === 'loading' ? (
      <LoadingIndicator height={30} width={30} color="white" />
    ) : txState === 'success' ? (
      <>
        Award was succesfully claimed <FaCheck />{' '}
      </>
    ) : txState === 'error' ? (
      <>
        Error claiming award, please try again later <HiEmojiSad />
      </>
    ) : (
      txState === 'idle' && (
        <div onClick={claim}>
          {`Claim your award `} <FaTrophy />
        </div>
      )
    );

  return (
    <div className={classes.container}>
      <div
        className={clsx(classes.content, inClaimPeriod && classes.inClaimPeriod)}
        onClick={e => e.stopPropagation()}
      >
        {claimed ? (
          <>
            {`Award has been claimed`}
            <FaCheckCircle />
          </>
        ) : inClaimPeriod ? (
          inClaimPeriodContent
        ) : passedSixHoursAfterRoundEnd ? (
          <>
            {`Award claim period will begin soon`}
            <FaClock />
          </>
        ) : (
          <>
            {`${hours > 0 && `${hours}h`} and ${minutes}m until award claim period begins`}
            <FaClock />
          </>
        )}
      </div>
    </div>
  );
};

export default ProposalCardClaimAwardBar;
