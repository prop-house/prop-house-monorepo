import Card from '../Card';
import AuctionHeader from '../AuctionHeader';

const LiveAuction = () => {
  return (
    <Card>
      <AuctionHeader
        id={1}
        fundingAmount={5}
        startDate={Date.now()}
        endDate={Date.now()}
      />
    </Card>
  );
};

export default LiveAuction;
