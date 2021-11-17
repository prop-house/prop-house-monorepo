import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import CreateProposalCTA from '../CreateProposalCTA';
import ProposalCards from '../ProposalCards';

const LiveAuction = () => {
  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.thirty}
    >
      <AuctionHeader
        id={1}
        fundingAmount={5}
        startDate={Date.now()}
        endDate={Date.now()}
      />
      <CreateProposalCTA />
      <ProposalCards />
    </Card>
  );
};

export default LiveAuction;
