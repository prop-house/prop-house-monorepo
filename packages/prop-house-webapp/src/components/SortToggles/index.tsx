import classes from './SortToggles.module.css';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useDispatch } from 'react-redux';
import { IoArrowDown, IoArrowUp } from 'react-icons/io5';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAppSelector } from '../../hooks';
import { isTimedAuction } from '../../utils/auctionType';
import { sortTimedRoundProposals, TimedRoundSortType } from '../../state/slices/propHouse';

const SortToggles: React.FC<{
  auction: StoredAuctionBase;
}> = props => {
  const { t } = useTranslation();
  const { auction } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const auctionEnded = auction && auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const auctionVoting = auction && auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const auctionNotStarted = auction && auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const allowSortByVotes = auctionVoting || auctionEnded;

  const [datesSorted, setDatesSorted] = useState(isProposingWindow ? true : false);
  const [dateAscending, setDateAscending] = useState(isProposingWindow ? true : false);
  const [votesSorted, setVotesSorted] = useState(auctionEnded || auctionVoting ? true : false);
  const [votesAscending, setVotesAscending] = useState(
    auctionEnded || auctionVoting ? true : false,
  );

  const dispatch = useDispatch();

  const disabled = () => !auction || auctionNotStarted || (proposals && proposals.length <= 1);

  const handleSortByVotes = () => {
    dispatch(
      sortTimedRoundProposals({
        sortType: TimedRoundSortType.VoteCount,
        ascending: votesAscending,
      }),
    );
    setVotesAscending(!votesAscending);
    setDatesSorted(false);
    setVotesSorted(true);
  };

  const handleSortByCreationDate = () => {
    dispatch(
      sortTimedRoundProposals({
        sortType: TimedRoundSortType.CreatedAt,
        ascending: dateAscending,
      }),
    );
    setDateAscending(!dateAscending);
    setDatesSorted(true);
    setVotesSorted(false);
  };

  return (
    <>
      <div className={classes.sortContainer}>
        {isTimedAuction(auction) && (
          <>
            {/** SORT BY BY VOTES */}
            {allowSortByVotes && (
              <div
                onClick={() => handleSortByVotes()}
                className={clsx(
                  classes.sortItem,
                  votesSorted && classes.active,
                  disabled() && classes.disabled,
                )}
              >
                <div className={classes.sortLabel}>{t('votesCap')}</div>
                {votesAscending ? <IoArrowDown size={'1.5rem'} /> : <IoArrowUp size={'1.5rem'} />}
              </div>
            )}
            {/** SORT BY BY CREATION DATE */}
            <div
              onClick={() => handleSortByCreationDate()}
              className={clsx(
                classes.sortItem,
                datesSorted && classes.active,
                (!auction || auctionNotStarted || (proposals && proposals.length <= 1)) &&
                  classes.disabled,
              )}
            >
              <div className={classes.sortLabel}>{t('created')}</div>
              {dateAscending ? <IoArrowDown size={'1.5rem'} /> : <IoArrowUp size={'1.5rem'} />}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SortToggles;
