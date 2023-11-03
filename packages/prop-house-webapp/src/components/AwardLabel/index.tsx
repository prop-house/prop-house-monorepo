import classes from './AwardLabel.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { RoundAward } from '@prophouse/sdk-react';
import { HiTrophy } from 'react-icons/hi2';
import LoadingIndicator from '../LoadingIndicator';
import { truncateThousands } from '../../utils/truncateThousands';
import { Dispatch, SetStateAction } from 'react';
import useFullRoundAwards from '../../hooks/useFullRoundAwards';
import { trophyColors } from '../../utils/trophyColors';

export const MoreAwardsLabel: React.FC<{
  setShowModal: Dispatch<SetStateAction<boolean>>;
  size?: number;
}> = props => {
  const { setShowModal, size } = props;
  return (
    <div
      onClick={e => {
        setShowModal(true);
        e.stopPropagation();
      }}
    >
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={classes.card}
      >
        <div style={{ fontSize: size ? size : '14px' }}>+</div>
      </Card>
    </div>
  );
};

const AwardLabel: React.FC<{ award: RoundAward; place: number; size?: number }> = props => {
  const { award, place, size } = props;
  const iconFill =
    place === 1
      ? trophyColors('first')
      : place === 2
      ? trophyColors('second')
      : trophyColors('third');

  const [loadingSymbols, loadingDecimals, fullRoundAwards] = useFullRoundAwards([award]);

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.ten} classNames={classes.card}>
      <HiTrophy size={size ? size : 14} color={iconFill} />
      {loadingDecimals || loadingSymbols ? (
        <LoadingIndicator height={18} width={26} />
      ) : (
        fullRoundAwards && (
          <div style={{ fontSize: size ? size : '14px' }}>
            {fullRoundAwards[0].parsedAmount >= 1000
              ? truncateThousands(fullRoundAwards[0].parsedAmount)
              : fullRoundAwards[0].parsedAmount}{' '}
            {fullRoundAwards[0].symbol}
          </div>
        )
      )}
    </Card>
  );
};
export default AwardLabel;
