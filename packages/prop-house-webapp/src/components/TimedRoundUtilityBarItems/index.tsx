import dayjs from 'dayjs';
import { deadlineCopy, deadlineTime } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import { RoundUtilBarItem, RoundUtilBarItemTooltip } from '../RoundUtilBarItem';
import { useTranslation } from 'react-i18next';
import { Proposal, Round } from '@prophouse/sdk-react';

const TimedRoundUtilityBarItems: React.FC<{
  round: Round;
  proposals: Proposal[];
}> = ({ round, proposals }) => {
  const { t } = useTranslation();

  return (
    <>
      <RoundUtilBarItemTooltip
        title={deadlineCopy(round)}
        content={diffTime(deadlineTime(round))}
        tooltipContent={`${dayjs(deadlineTime(round)).tz().format('MMMM D, YYYY h:mm A z')}`}
        titleColor="purple"
      />
      <RoundUtilBarItem
        title={proposals.length === 1 ? t('proposalCap') : t('proposalsCap')}
        content={proposals.length.toString()}
      />
    </>
  );
};
export default TimedRoundUtilityBarItems;
