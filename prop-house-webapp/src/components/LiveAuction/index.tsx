import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';

const LiveAuction = () => {
  return (
    <Card bgColor={CardBgColor.Light} borderRadius={CardBorderRadius.thirty}>
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
