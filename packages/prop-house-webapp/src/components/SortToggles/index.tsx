import classes from './SortToggles.module.css';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
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

const InfRoundSortToggles: React.FC<{
  auction: StoredAuctionBase;
}> = props => {
  const { auction } = props;

  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isInfRoundOver =
    proposals && isInfAuction(auction) && infRoundBalance(proposals, auction) === 0;

  const dispatch = useDispatch();

  const handleFilterInfRoundProps = (type: InfRoundFilterType) => {
    if (!isInfAuction(auction)) return;

    dispatch(
      filterInfRoundProposals({
        type,
        round: auction,
      }),
    );
    dispatch(setInfRoundFilterType(type));
  };

  return (
    <>
      <div className={classes.sortContainer}>
        {isInfAuction(auction) && (
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
              onClick={() => handleFilterInfRoundProps(InfRoundFilterType.Rejected)}
              className={clsx(
                classes.sortItem,
                infRoundFilter === InfRoundFilterType.Rejected && classes.active,
              )}
            >
              <div className={classes.sortLabel}>Rejected</div>
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

export default InfRoundSortToggles;
