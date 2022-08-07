import classes from './SortToggles.module.css';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import { IoArrowDown, IoArrowUp } from 'react-icons/io5';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const SortToggles: React.FC<{
  auction: StoredAuction;
}> = props => {
  const { t } = useTranslation();
  const { auction } = props;

  const auctionEnded = auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const auctionVoting = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const allowSortByVotes = auctionVoting || auctionEnded;

  const [datesSorted, setDatesSorted] = useState(false);
  const [dateAscending, setDateAscending] = useState(false);
  const [votesSorted, setVotesSorted] = useState(auctionEnded ? true : false);
  const [votesAscending, setVotesAscending] = useState(auctionEnded ? true : false);

  const dispatch = useDispatch();

  return (
    <>
      <div className={classes.sortContainer}>
        {allowSortByVotes && (
          <div
            onClick={() => {
              dispatchSortProposals(dispatch, SortType.Score, votesAscending);
              setVotesAscending(!votesAscending);
              setDatesSorted(false);
              setVotesSorted(true);
            }}
            className={clsx(classes.sortItem, votesSorted && classes.active)}
          >
            <div className={classes.sortLabel}>{t('votes')}</div>
            {votesAscending ? <IoArrowDown size={'1.5rem'} /> : <IoArrowUp size={'1.5rem'} />}
          </div>
        )}

        <div
          onClick={() => {
            dispatchSortProposals(dispatch, SortType.CreatedAt, dateAscending);
            setDateAscending(!dateAscending);
            setDatesSorted(true);
            setVotesSorted(false);
          }}
          className={clsx(classes.sortItem, datesSorted && classes.active)}
        >
          <div className={classes.sortLabel}>{t('created')}</div>
          {dateAscending ? <IoArrowDown size={'1.5rem'} /> : <IoArrowUp size={'1.5rem'} />}
        </div>
      </div>
    </>
  );
};

export default SortToggles;
