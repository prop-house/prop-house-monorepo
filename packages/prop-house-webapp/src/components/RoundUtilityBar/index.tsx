import classes from './RoundUtilityBar.module.css';
import clsx from 'clsx';
import {
  deadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import SortToggles from '../SortToggles';
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
import { Round, RoundState } from '@prophouse/sdk-react';

export interface RoundUtilityBarProps {
  round: Round;
}

const RoundUtilityBar = ({ round }: RoundUtilityBarProps) => {
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const { t } = useTranslation();

  return (
    <div className={classes.roundUtilityBar}>
      {/** FILTERS */}
      <div className={classes.utilitySection}>
        {round.state >= RoundState.IN_PROPOSING_PERIOD && (
          <div
            className={clsx(
              classes.sortToggles,
              isInfAuction(round) && classes.displaySortToggles,
            )}
          >
            <SortToggles round={round} />
          </div>
        )}
      </div>

      {/** ROUND DATA */}
      <div className={classes.utilitySection}>
        <Col className={classes.propHouseDataRow}>
          {/** TIMED AUCTION */}
          {isTimedAuction(round) && (
            <>
              {/** PROP DEADLINE  */}
              <RoundUtilBarItemTooltip
                title={deadlineCopy(round)}
                content={diffTime(deadlineTime(round))}
                tooltipContent={`${dayjs.unix(deadlineTime(round))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
                titleColor="purple"
              />
              {/** FUNDING */}
              {/* TODO: Add support for multiple award assets */}
              {/* <RoundUtilBarItem
                title={t('funding')}
                content={
                  <>
                    <TruncateThousands
                      amount={round.fundingAmount}
                      decimals={countDecimals(round.fundingAmount) === 3 ? 3 : 2}
                    />{' '}
                    {round.currencyType} <span className={classes.xDivide} />
                    {' × '} {round.config.winnerCount}
                  </>
                }
              /> */}
              {/** SNAPSHOT */}
              <RoundUtilBarItemTooltip
                title={t('Snapshot')}
                content={round.config.proposalPeriodEndTimestamp.toString()}
                tooltipContent={`Voters with ${community?.name} NFTs in their wallets before the snapshot block are eligible to vote.`}
              />
            </>
          )}

          {/** INF AUCTION */}
          {/* {isInfAuction(round) && (
            <>
              QUORUM
              <RoundUtilBarItemTooltip
                title="Quorum"
                content={`${round.quorum} votes`}
                tooltipContent={'Votes required to get funded'}
              />

              VOTING PERIOD
              <RoundUtilBarItemTooltip
                title="Voting period"
                content={timestampToDateUnit(round.votingPeriod)}
                tooltipContent={'Period of time each prop has to achieve quorum'}
                titleColor="purple"
              />

              BALANCE
              <RoundUtilBarItemBalance
                content={
                  <>
                    <TruncateThousands
                      amount={
                        isInfAuction(round) && proposals ? infRoundBalance(proposals, round) : 0
                      }
                      decimals={countDecimals(round.fundingAmount) === 3 ? 3 : 2}
                    />{' '}
                    {round.currencyType}
                  </>
                }
                progress={
                  isInfAuction(round) && proposals ? infRoundBalance(proposals, round) : 0
                }
              />
            </>
          )} */}

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
