import classes from './RoundUtilityBar.module.css';
import clsx from 'clsx';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import SortToggles from '../SortToggles';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import TimedRoundUtilityBar from '../TimedRoundUtilityBar';
import InfRoundUtilityBar from '../InfRoundUtilityBar';

export interface RoundUtilityBarProps {
  auction: StoredAuctionBase;
}

const RoundUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const community = useAppSelector(state => state.propHouse.activeCommunity);

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
        <Col
          className={clsx(
            classes.propHouseDataRow,
            isInfAuction(auction) ? classes.hideFourthItemOnMobile : classes.hideThirdItemOnMobile,
          )}
        >
          {isTimedAuction(auction) && community && proposals && (
            <TimedRoundUtilityBar
              timedRound={auction}
              community={community}
              proposals={proposals}
            />
          )}

          {isInfAuction(auction) && proposals && (
            <InfRoundUtilityBar infRound={auction} proposals={proposals} />
          )}
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
