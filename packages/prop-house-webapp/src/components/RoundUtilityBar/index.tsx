import classes from './RoundUtilityBar.module.css';
import clsx from 'clsx';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { Round, Timed } from '@prophouse/sdk-react';
import TimedRoundUtilityBarItems from '../TimedRoundUtilityBarItems';

const RoundUtilityBar: React.FC<{ round: Round }> = props => {
  const { round } = props;
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  return (
    <div className={classes.roundUtilityBar}>
      {/** FILTERS */}
      <div className={classes.utilitySection}>
        {round.state < Timed.RoundState.IN_PROPOSING_PERIOD && (
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
