import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StatusPillState } from '../StatusPill';
import { StoredAuction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import RenderedProposal from '../RenderedProposal';

export enum AuctionStatus {
  NotStarted,
  AcceptingProposals,
  Voting,
  Ended,
}

const FullProposal: React.FC<{
  proposal: StoredProposal;
}> = (props) => {
  const { proposal } = props;

  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.thirty}
    >
      <RenderedProposal proposal={proposal} />
    </Card>
  );
};

export default FullProposal;
