import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';

const FullAuction: React.FC<{
  showAllProposals: boolean;
}> = (props) => {
  const { showAllProposals } = props;
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
      <Row>
        <Col xs={4} md={2}>
          <div className={classes.proposalTitle}>Proposals</div>
        </Col>
        <Col xs={8} md={10}>
          <div className={classes.divider} />
        </Col>
      </Row>
      <ProposalCards />
      {!showAllProposals && <AllProposalsCTA />}
    </Card>
  );
};

export default FullAuction;
