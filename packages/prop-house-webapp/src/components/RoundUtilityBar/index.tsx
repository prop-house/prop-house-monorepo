import classes from './RoundUtilityBar.module.css';
import clsx from 'clsx';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import SortToggles from '../SortToggles';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import TimedRoundUtilityBar from '../TimedRoundUtilityBarItems';
import InfRoundUtilityBar from '../InfRoundUtilityBar';
import { Round, RoundState } from '@prophouse/sdk-react';
import InfRoundSortToggles from '../SortToggles';
import TimedRoundUtilityBarItems from '../TimedRoundUtilityBarItems';

const RoundUtilityBar: React.FC<{ round: Round }> = props => {
  const { round } = props;
  const proposals = useAppSelector(state => state.propHouse.onchainActiveProposals);

  return (
    <div className={classes.roundUtilityBar}>
      {/** FILTERS */}
      <div className={classes.utilitySection}>
        {round.state < RoundState.IN_PROPOSING_PERIOD && (
          <div
            className={clsx(
              classes.sortToggles,
              // isInfAuction(auction) && classes.displaySortToggles,
            )}
          >
            {/* <InfRoundSortToggles/> */}
          </div>
        )}
      </div>
      {/** ROUND DATA */}
      <div className={classes.utilitySection}>
        <Col
          className={clsx(
            classes.propHouseDataRow,
            // isInfAuction(auction) ? classes.hideFourthItemOnMobile : classes.hideThirdItemOnMobile,
          )}
        >
          {proposals && <TimedRoundUtilityBarItems round={round} proposals={proposals} />}

          {/* {isInfAuction(auction) && proposals && (
            <InfRoundUtilityBar infRound={auction} proposals={proposals} />
          )} */}
        </Col>
      </div>
    </div>
  );
};

export default RoundUtilityBar;
