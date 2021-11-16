import AuctionHeader from '../AuctionHeader';

const Auctions = () => {
  return (
    <>
      <AuctionHeader
        id={1}
        fundingAmount={5}
        startDate={Date.now()}
        endDate={Date.now()}
      />
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
