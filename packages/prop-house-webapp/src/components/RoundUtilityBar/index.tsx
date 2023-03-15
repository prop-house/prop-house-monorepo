import classes from './RoundUtilityBar.module.css';
import RoundDropdown, { SortMethod } from '../RoundDropdown';
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
import { Col, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import dayjs from 'dayjs';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import { useAppSelector } from '../../hooks';
import TruncateThousands from '../TruncateThousands';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { countDecimals } from '../../utils/countDecimals';

export interface RoundUtilityBarProps {
  auction: StoredAuctionBase;
}

const RoundUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const auctionEnded = auction && auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const auctionVoting = auction && auctionStatus(auction) === AuctionStatus.AuctionVoting;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const community = useAppSelector(state => state.propHouse.activeCommunity);

  const infRoundBalance = () => {
    if (!isInfAuction(auction) || !proposals) return auction.fundingAmount;

    return (
      auction.fundingAmount -
      proposals.reduce((prev, prop) => {
        const won = prop.voteCount > auction.quorum;
        const reqAmount = Number(prop.reqAmount);
        return !won && reqAmount !== null ? prev : prev + reqAmount;
      }, 0)
    );
  };

  const allowSortByVotes = auctionVoting || auctionEnded;

  const [sortSelection, setSortSelection] = useState<number>(
    auctionEnded ? SortMethod.MostVotes : SortMethod.SortBy,
  );
  const { t } = useTranslation();

  return (
    <div className={classes.roundUtilityBar}>
      <div className={classes.utilitySection}>
        {auctionStatus(auction) !== AuctionStatus.AuctionNotStarted && (
          <div className={classes.sortToggles}>
            <SortToggles auction={auction} />
          </div>
        )}

        <div className={clsx(classes.dropdown, 'houseDropdown')}>
          {auctionStatus(auction) !== AuctionStatus.AuctionNotStarted && (
            <RoundDropdown
              sortSelection={sortSelection}
              setSortSelection={setSortSelection}
              allowSortByVotes={allowSortByVotes}
            />
          )}
        </div>
      </div>

      <div className={classes.utilitySection}>
        <Col className={classes.propHouseDataRow}>
          <div className={classes.item}>
            {auction ? (
              <>
                <Tooltip
                  content={
                    <>
                      <div className={clsx(classes.itemTitle, classes.purpleText)}>
                        {isInfAuction(auction) ? 'Quorum' : deadlineCopy(auction)}{' '}
                        <span className="infoSymbol">
                          <MdInfoOutline />
                        </span>
                      </div>

                      <div className={classes.itemData}>
                        {isInfAuction(auction)
                          ? `${auction.quorum} votes`
                          : diffTime(deadlineTime(auction))}
                      </div>
                    </>
                  }
                  tooltipContent={
                    isInfAuction(auction)
                      ? 'Votes required to get funded'
                      : `${dayjs(deadlineTime(auction)).tz().format('MMMM D, YYYY h:mm A z')}`
                  }
                />
              </>
            ) : (
              <>
                <div className={classes.itemTitle}>Deadline</div>
                <div className={classes.itemData}>-</div>
              </>
            )}
          </div>

          <div className={clsx(classes.item, isInfAuction(auction) && classes.displayProgBar)}>
            <div>
              <div className={classes.itemTitle}>
                {isInfAuction(auction) ? 'Balance' : t('funding')}
              </div>
              <div className={classes.itemData}>
                <TruncateThousands
                  amount={isTimedAuction(auction) ? auction.fundingAmount : infRoundBalance()}
                  decimals={countDecimals(auction.fundingAmount) === 3 ? 3 : 2}
                />{' '}
                {auction.currencyType} <span className={classes.xDivide} />
                {isTimedAuction(auction) && (
                  <>
                    {' × '} {auction.numWinners}
                  </>
                )}
              </div>
            </div>

            {isInfAuction(auction) && (
              <div className={classes.progressBar}>
                <div className={classes.progress} style={{ height: `${infRoundBalance()}%` }}></div>
              </div>
            )}
          </div>

          <div className={classes.item}>
            <div className={classes.itemTitle}>
              {proposals && proposals.length === 1 ? t('proposalCap') : t('proposalsCap')}
            </div>
            <div className={classes.itemData}>{proposals && proposals.length}</div>
          </div>

          {auction.balanceBlockTag !== 0 && (
            <div className={classes.item}>
              <Tooltip
                content={
                  <>
                    <div className={classes.itemTitle}>
                      {t('Snapshot')}
                      <span className="infoSymbol">
                        <MdInfoOutline />
                      </span>
                    </div>

                    <div className={classes.itemData}>{auction.balanceBlockTag.toString()}</div>
                  </>
                }
                tooltipContent={`Voters with ${community?.name} NFTs in their wallets before the snapshot block are eligible to vote.`}
              />
            </div>
          )}
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
