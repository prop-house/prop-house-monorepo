import AdminTool from '../../AdminTool';
import classes from './Auction.module.css';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../hooks';
import { findAuctionById } from '../../../utils/findAuctionById';
import NotFound from '../NotFound';
import FullAuction from '../../FullAuction';
import highestAuctionId from '../../../utils/highestAuctionId';
import BrowseControl from '../../BrowseControl';

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
      <BrowseControl auctionId={id} highestId={highestId} />
      {auction ? <FullAuction auction={auction} /> : <NotFound />}
    </>
  );
};

export default Auction;
