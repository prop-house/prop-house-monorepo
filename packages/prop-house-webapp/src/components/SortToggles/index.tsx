import classes from './SortToggles.module.css';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { useAppSelector } from '../../hooks';
import { isInfAuction } from '../../utils/auctionType';
import {
  filterInfRoundProposals,
  InfRoundFilterType,
  setInfRoundFilterType,
} from '../../state/slices/propHouse';
import { infRoundBalance } from '../../utils/infRoundBalance';
import { Round } from '@prophouse/sdk-react';

const SortToggles: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isInfRoundOver =
    proposals && isInfAuction(round) && infRoundBalance(proposals, round) === 0;

  const dispatch = useDispatch();

  const handleFilterInfRoundProps = (type: InfRoundFilterType) => {
    if (!isInfAuction(round)) return;

    dispatch(
      filterInfRoundProposals({
        type,
        round,
      }),
    );
    dispatch(setInfRoundFilterType(type));
  };

  return (
    <>
      <div className={classes.sortContainer}>
        {isInfAuction(round) && (
          <>
            {!isInfRoundOver && (
              <div
                onClick={() => handleFilterInfRoundProps(InfRoundFilterType.Active)}
                className={clsx(
                  classes.sortItem,
                  infRoundFilter === InfRoundFilterType.Active && classes.active,
                )}
              >
                <div className={classes.sortLabel}>Active</div>
              </div>
            )}

            <div
              onClick={() => handleFilterInfRoundProps(InfRoundFilterType.Winners)}
              className={clsx(
                classes.sortItem,
                infRoundFilter === InfRoundFilterType.Winners && classes.active,
              )}
            >
              <div className={classes.sortLabel}>Winners</div>
            </div>
            <div
              onClick={() => handleFilterInfRoundProps(InfRoundFilterType.Stale)}
              className={clsx(
                classes.sortItem,
                infRoundFilter === InfRoundFilterType.Stale && classes.active,
              )}
            >
              <div className={classes.sortLabel}>Stale</div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SortToggles;
