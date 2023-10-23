import classes from './AwardLabel.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { RoundAward } from '@prophouse/sdk-react';
import { HiTrophy } from 'react-icons/hi2';
import LoadingIndicator from '../LoadingIndicator';
import { truncateThousands } from '../../utils/truncateThousands';
import { Dispatch, SetStateAction } from 'react';
import useFullRoundAwards from '../../hooks/useFullRoundAward';

export const MoreAwardsLabel: React.FC<{
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowModal } = props;
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
        +
      </Card>
    </div>
  );
};

const AwardLabel: React.FC<{ award: RoundAward; place: number }> = props => {
  const { award, place } = props;
  const iconFill = place === 1 ? 'F6A64E' : place === 2 ? 'C0C0C0' : 'AC6700';

  const [loadingSymbols, loadingDecimals, fullRoundAwards] = useFullRoundAwards([award]);

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.ten} classNames={classes.card}>
      <HiTrophy size={14} color={iconFill} />
      {loadingDecimals || loadingSymbols ? (
        <LoadingIndicator height={18} width={26} />
      ) : (
        fullRoundAwards && (
          <>
            {fullRoundAwards[0].parsedAmount >= 1000
              ? truncateThousands(fullRoundAwards[0].parsedAmount)
              : fullRoundAwards[0].parsedAmount}{' '}
            {fullRoundAwards[0].symbol}
          </>
        )
      )}
    </Card>
  );
};
export default AwardLabel;
