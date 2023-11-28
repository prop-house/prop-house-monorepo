import classes from './CancelRoundWidget.module.css';
import { Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import React, { useState } from 'react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';
import LoadingIndicator from '../LoadingIndicator';

const CancelRoundWidget: React.FC<{ round: Round }> = ({ round }) => {
  const [txState, setTxState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const propHouse = usePropHouse();
  const isCanceled = round.state === Timed.RoundState.CANCELLED;
  const isActive =
    round.state === Timed.RoundState.NOT_STARTED ||
    round.state === Timed.RoundState.IN_PROPOSING_PERIOD ||
    round.state === Timed.RoundState.IN_VOTING_PERIOD;

  const cancelRound = async () => {
    try {
      setTxState('loading');
      const tx = await propHouse.round.timed.cancel(round.address);
      await tx.wait();
      setTxState('success');
    } catch (e) {
      setTxState('error');
      setTimeout(() => setTxState('idle'), 10000);
      console.log(e);
    }
  };

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={classes.cancelRoundCard}
    >
      <div className={classes.cancelRoundText}>
        {txState === 'success'
          ? 'Round has been canceled'
          : isCanceled
          ? `Round has already been canceled.`
          : !isActive
          ? 'Round is not in an active state and cannot be canceled.'
          : `Canceling a round will disable proposing, voting and will immediately allow
                      depositors to reclaim their assets. This action cannot be undone.`}
      </div>
      <Button
        bgColor={ButtonColor.Red}
        text={
          isCanceled ? (
            'Round already canceled'
          ) : txState === 'idle' ? (
            'Cancel round'
          ) : txState === 'loading' ? (
            <LoadingIndicator height={22} width={30} />
          ) : txState === 'error' ? (
            'Error, please try again'
          ) : (
            txState === 'success' && 'Successfully canceled round'
          )
        }
        disabled={isCanceled || !isActive || txState !== 'idle'}
        onClick={cancelRound}
      />
    </Card>
  );
};

export default CancelRoundWidget;
