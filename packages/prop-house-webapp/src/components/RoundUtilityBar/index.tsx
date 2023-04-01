import classes from './RoundUtilityBar.module.css';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  deadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import SortToggles from '../SortToggles';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAppSelector } from '../../hooks';
import TruncateThousands from '../TruncateThousands';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { countDecimals } from '../../utils/countDecimals';
import { timestampToDateUnit } from '../../utils/timestampToDateUnit';
import {
  RoundUtilBarItem,
  RoundUtilBarItemBalance,
  RoundUtilBarItemTooltip,
} from '../RoundUtilBarItem';
import { infRoundBalance } from '../../utils/infRoundBalance';

export interface RoundUtilityBarProps {
  auction: StoredAuctionBase;
}

const RoundUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const { t } = useTranslation();

  return (
    <div className={classes.roundUtilityBar}>
      {/** FILTERS */}
      <div className={classes.utilitySection}>
        {auctionStatus(auction) !== AuctionStatus.AuctionNotStarted && (
          <div
            className={clsx(
              classes.sortToggles,
              isInfAuction(auction) && classes.displaySortToggles,
            )}
          >
            <SortToggles auction={auction} />
          </div>
        )}
      </div>

      {/** ROUND DATA */}
      <div className={classes.utilitySection}>
        <Col className={classes.propHouseDataRow}>
          {/** TIMED AUCTION */}
          {isTimedAuction(auction) && (
            <>
              {/** PROP DEADLINE  */}
              <RoundUtilBarItemTooltip
                title={deadlineCopy(auction)}
                content={diffTime(deadlineTime(auction))}
                tooltipContent={`${dayjs(deadlineTime(auction))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
                titleColor="purple"
              />
              {/** FUNDING */}
              <RoundUtilBarItem
                title={t('funding')}
                content={
                  <>
                    <TruncateThousands
                      amount={auction.fundingAmount}
                      decimals={countDecimals(auction.fundingAmount) === 3 ? 3 : 2}
                    />{' '}
                    {auction.currencyType} <span className={classes.xDivide} />
                    {' × '} {auction.numWinners}
                  </>
                }
              />
              {/** SNAPSHOT */}
              <RoundUtilBarItemTooltip
                title={t('Snapshot')}
                content={auction.balanceBlockTag.toString()}
                tooltipContent={`Voters with ${community?.name} NFTs in their wallets before the snapshot block are eligible to vote.`}
              />
            </>
          )}

          {/** INF AUCTION */}
          {isInfAuction(auction) && (
            <>
              {/** QUORUM */}
              <RoundUtilBarItemTooltip
                title="Quorum"
                content={`${auction.quorum} votes`}
                tooltipContent={'Votes required to get funded'}
              />

              {/** VOTING PERIOD */}
              <RoundUtilBarItemTooltip
                title="Voting period"
                content={timestampToDateUnit(auction.votingPeriod)}
                tooltipContent={'Period of time each prop has to achieve quorum'}
                titleColor="purple"
              />

              {/**  BALANCE  */}
              <RoundUtilBarItemBalance
                content={
                  <>
                    <TruncateThousands
                      amount={
                        isInfAuction(auction) && proposals ? infRoundBalance(proposals, auction) : 0
                      }
                      decimals={countDecimals(auction.fundingAmount) === 3 ? 3 : 2}
                    />{' '}
                    {auction.currencyType}
                  </>
                }
                progress={
                  isInfAuction(auction) && proposals ? infRoundBalance(proposals, auction) : 0
                }
              />
            </>
          )}

          {/** NUMBER OF PROPS */}
          {proposals && (
            <RoundUtilBarItem
              title={proposals.length === 1 ? t('proposalCap') : t('proposalsCap')}
              content={proposals.length.toString()}
            />
          )}
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
