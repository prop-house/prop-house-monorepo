import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import CreateProposalCTA from '../CreateProposalCTA';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';

const FullAuction = () => {
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
      <AllProposalsCTA />
    </Card>
  );
};

export default FullAuction;
