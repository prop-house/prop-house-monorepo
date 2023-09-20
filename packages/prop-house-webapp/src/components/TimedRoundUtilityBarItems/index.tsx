import dayjs from 'dayjs';
import { deadlineCopy, deadlineTime } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import { RoundUtilBarItem, RoundUtilBarItemTooltip } from '../RoundUtilBarItem';
import TruncateThousands from '../TruncateThousands';
import { useTranslation } from 'react-i18next';
import { countDecimals } from '../../utils/countDecimals';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { Proposal, Round } from '@prophouse/sdk-react';
import AwardsDisplay from '../AwardsDisplay';

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
      <RoundUtilBarItem title={'Awards'} content={<AwardsDisplay awards={round.config.awards} />} />
      <RoundUtilBarItem
        title={proposals.length === 1 ? t('proposalCap') : t('proposalsCap')}
        content={proposals.length.toString()}
      />
    </>
  );
};
export default TimedRoundUtilityBarItems;
