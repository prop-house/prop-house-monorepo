import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import CreateProposalCTA from '../CreateProposalCTA';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';

const FullAuction: React.FC<{
  showCreateProposalCTA: boolean;
  showAllProposals: boolean;
}> = (props) => {
  const { showCreateProposalCTA, showAllProposals } = props;
  console.log('showCreateProposalCTA: ', showCreateProposalCTA);
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
      {showCreateProposalCTA && <CreateProposalCTA />}
      <ProposalCards />
      {!showAllProposals && <AllProposalsCTA />}
    </Card>
  );
};

export default FullAuction;
