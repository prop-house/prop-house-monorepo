import classes from './AuctionHeader.module.css';
import { Col, Row } from 'react-bootstrap';

const AuctionHeader: React.FC<{
  id: number;
  fundingAmount: number;
  startDate: number;
  endDate: number;
}> = (props) => {
  const { id, fundingAmount, startDate, endDate } = props;

  return (
    <Row className={classes.container}>
      <Col xl={6} className={classes.leftSectionContainer}>
        <div className={classes.leftSectionTitle}>{`Auction ${id}`}</div>
        <div className={classes.leftSectionSubtitle}>
          {`${new Date(startDate).toDateString()} - ${new Date(
            endDate
          ).toDateString()}`}
        </div>
      </Col>
      <Col xl={3} xs={6} className={classes.rightSectionSubsection}>
        <div className={classes.rightSectionTitle}>Funding</div>
        <div className={classes.rightSectionSubtitle}>{`${fundingAmount.toFixed(
          2
        )} Ξ`}</div>
      </Col>
      <Col xl={3} xs={6} className={classes.rightSectionSubsection}>
        <div className={classes.rightSectionTitle}>Proposal deadline</div>
        <div className={classes.rightSectionSubtitle}>3 days left</div>
      </Col>
    </Row>
  );
};

export default AuctionHeader;
