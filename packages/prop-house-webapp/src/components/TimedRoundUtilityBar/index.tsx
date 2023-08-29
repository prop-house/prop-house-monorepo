import dayjs from 'dayjs';
import { deadlineCopy, deadlineTime } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import { RoundUtilBarItem, RoundUtilBarItemTooltip } from '../RoundUtilBarItem';
import TruncateThousands from '../TruncateThousands';
import { useTranslation } from 'react-i18next';
import { countDecimals } from '../../utils/countDecimals';
import {
  Community,
  StoredProposal,
  StoredTimedAuction,
} from '@nouns/prop-house-wrapper/dist/builders';

const TimedRoundUtilityBar: React.FC<{
  timedRound: StoredTimedAuction;
  community: Community;
  proposals: StoredProposal[];
}> = ({ timedRound, community, proposals }) => {
  const { t } = useTranslation();
  return (
    <>
      <RoundUtilBarItemTooltip
        title={deadlineCopy(timedRound)}
        content={diffTime(deadlineTime(timedRound))}
        tooltipContent={`${dayjs(deadlineTime(timedRound)).tz().format('MMMM D, YYYY h:mm A z')}`}
        titleColor="purple"
      />

      <RoundUtilBarItem
        title={'Awards'}
        content={
          <>
            <TruncateThousands
              amount={timedRound.fundingAmount}
              decimals={countDecimals(timedRound.fundingAmount) === 3 ? 3 : 2}
            />{' '}
            {timedRound.currencyType}
            {' × '} {timedRound.numWinners}
          </>
        }
      />

      <RoundUtilBarItem
        title={proposals.length === 1 ? t('proposalCap') : t('proposalsCap')}
        content={proposals.length.toString()}
      />
    </>
  );
};
export default TimedRoundUtilityBar;
