import AdminTool from '../../AdminTool';
import classes from './Auction.module.css';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../hooks';
import { findAuctionById } from '../../../utils/findAuctionById';
import NotFound from '../NotFound';
import FullAuction from '../../FullAuction';
import clsx from 'clsx';
import highestAuctionId from '../../../utils/highestAuctionId';
import { Link } from 'react-router-dom';

const Auction = () => {
  const params = useParams();
  const id = Number(params.id);

  const auction = useAppSelector((state) =>
    findAuctionById(id, state.propHouse.auctions)
  );

  const highestId = useAppSelector((state) =>
    highestAuctionId(state.propHouse.auctions)
  );

  return (
    <>
      <div className={classes.auctionNav}>
        <Link
          to={`/auction/${id - 1}`}
          className={clsx(id <= 1 ? classes.navDisabled : classes.navEnabled)}
        >
          Previous Auction
        </Link>
        <Link
          to={`/auction/${id + 1}`}
          className={clsx(
            id >= highestId ? classes.navDisabled : classes.navEnabled
          )}
        >
          Next Auction
        </Link>
      </div>
      {auction ? <FullAuction auction={auction} /> : <NotFound />}
    </>
  );
};

export default Auction;
