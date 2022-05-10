import {
  Community,
  StoredAuction,
} from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import AuctionHeader from '../AuctionHeader';
import FullAuction from '../FullAuction';

const AuctionPartial = (
  auction: StoredAuction,
  i: number,
  community: Community
) => (
  <div key={i}>
    {i === 0 ? (
      <FullAuction auction={auction} />
    ) : (
      <AuctionHeader auction={auction} clickable={true} community={community} />
    )}
  </div>
);

const Auctions: React.FC<{ community: Community }> = (props) => {
  const { community } = props;
  const auctions = useAppSelector((state) => state.propHouse.auctions);
  return (
    <>
      {auctions.map((auction, index) =>
        AuctionPartial(auction, index, community)
      )}
    </>
  );
};

export default Auctions;
