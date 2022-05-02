import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import AuctionHeader from '../AuctionHeader';
import FullAuction from '../FullAuction';

const AuctionPartial = (auction: StoredAuction, i: number) => (
  <div key={i}>
    {i === 0 ? (
      <FullAuction auction={auction} />
    ) : (
      <AuctionHeader auction={auction} clickable={true} />
    )}
  </div>
);

const Auctions = () => {
  const auctions = useAppSelector((state) => state.propHouse.auctions);
  return <>{auctions.map(AuctionPartial)}</>;
};

export default Auctions;
