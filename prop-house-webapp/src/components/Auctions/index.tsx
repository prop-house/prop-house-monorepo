import AuctionHeader from '../AuctionHeader';
import LiveAuction from '../LiveAuction';

const Auctions = () => {
  return (
    <>
      <LiveAuction />
      <AuctionHeader
        id={2}
        fundingAmount={10}
        startDate={Date.now()}
        endDate={Date.now()}
      />
      <AuctionHeader
        id={3}
        fundingAmount={20}
        startDate={Date.now()}
        endDate={Date.now()}
      />
    </>
  );
};

export default Auctions;
