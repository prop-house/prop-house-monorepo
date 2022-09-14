import classes from './RoundUtilityBar.module.css';
import RoundDropdown, { OptionType } from '../RoundDropdown';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  DeadlineCopy,
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

export interface RoundUtilityBarProps {
  auction: StoredAuction;
}

const RoundUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const auctionEnded = auction && auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const auctionVoting = auction && auctionStatus(auction) === AuctionStatus.AuctionVoting;

  const allowSortByVotes = auctionVoting || auctionEnded;

  const [datesSorted, setDatesSorted] = useState(false);
  const [dateAscending, setDateAscending] = useState(false);
  const [votesSorted, setVotesSorted] = useState(auctionEnded ? true : false);
  const [votesAscending, setVotesAscending] = useState(auctionEnded ? true : false);

  const [sortSelection, setSortSelection] = useState<number>(
    auctionEnded ? OptionType.MostVotes : OptionType.SortBy,
  );
  const { t } = useTranslation();

  return (
    <div className={classes.roundUtilityBar}>
      <div className={classes.utilitySection}>
        <div className={classes.sortToggles}>
          <SortToggles
            auction={auction}
            datesSorted={datesSorted}
            setDatesSorted={setDatesSorted}
            dateAscending={dateAscending}
            setDateAscending={setDateAscending}
            votesSorted={votesSorted}
            setVotesSorted={setVotesSorted}
            votesAscending={votesAscending}
            setVotesAscending={setVotesAscending}
          />
        </div>

        <div className={clsx(classes.dropdown, 'houseDropdown')}>
          <RoundDropdown
            sortSelection={sortSelection}
            setSortSelection={setSortSelection}
            allowSortByVotes={allowSortByVotes}
          />
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
                        {DeadlineCopy(auction)}
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
              {auction ? `${auction.fundingAmount.toFixed(2)} Ξ x ${auction.numWinners}` : '-'}
            </div>
          </div>

          <div className={clsx(classes.item, classes.proposalCountItem)}>
            <div className={classes.itemTitle}>
              {auction.proposals.length === 1 ? 'Proposal' : 'Proposals'}
            </div>
            <div className={classes.itemData}>{auction.proposals.length}</div>
          </div>
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
