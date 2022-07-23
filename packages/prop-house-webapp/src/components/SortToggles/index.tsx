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

  const [datesSorted, setDatesSorted] = useState(auctionEnded ? false : true);
  const [dateAscending, setDateAscending] = useState(auctionEnded ? false : true);
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
            <div>{t('votes')}</div>
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
          <div>{t('created')}</div>
          {dateAscending ? <IoArrowUp size={'1.5rem'} /> : <IoArrowDown size={'1.5rem'} />}
        </div>
      </div>
    </>
  );
};

export default SortToggles;
