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
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import dayjs from 'dayjs';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import { useAppSelector } from '../../hooks';
import TruncateThousands from '../TruncateThousands';

export interface RoundUtilityBarProps {
  auction: StoredAuction;
}

const RoundUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const auctionEnded = auction && auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const auctionVoting = auction && auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

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
                        {deadlineCopy(auction)}{' '}
                        <span className="infoSymbol">
                          <MdInfoOutline />
                        </span>
                      </div>

                      <div className={classes.itemData}>{diffTime(deadlineTime(auction))}</div>
                    </>
                  }
                  tooltipContent={`${dayjs(deadlineTime(auction))
                    .tz()
                    .format('MMMM D, YYYY h:mm A z')}`}
                />
              </>
            ) : (
              <>
                <div className={classes.itemTitle}>Deadline</div>
                <div className={classes.itemData}>-</div>
              </>
            )}
          </div>

          <div className={classes.item}>
            <div className={classes.itemTitle}>{t('funding')}</div>

            <div className={classes.itemData}>
              <TruncateThousands amount={auction.fundingAmount} decimals={2} />{' '}
              {auction.currencyType} <span className={classes.xDivide}>{' × '}</span>{' '}
              {auction.numWinners}
            </div>
          </div>

          <div className={clsx(classes.item, classes.proposalCountItem)}>
            <div className={classes.itemTitle}>
              {proposals && proposals.length === 1 ? 'Proposal' : 'Proposals'}
            </div>
            <div className={classes.itemData}>{proposals && proposals.length}</div>
          </div>
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
