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
    <Row>
      <Col xl={12}>
        <div className={classes.wrapper}>
          <div>
            <h1 className={classes.leftSectionTitle}>{`Auction ${id}`}</h1>
            <h3 className={classes.leftSectionSubtitle}>
              {`${new Date(startDate).toDateString()} - ${new Date(
                endDate
              ).toDateString()}`}
            </h3>
          </div>
          <div className={classes.rightSection}>
            <div>
              <h3 className={classes.rightSectionTitle}>Funding</h3>
              <h1
                className={classes.rightSectionSubtitle}
              >{`${fundingAmount} Ξ`}</h1>
            </div>
            <div>
              <h3 className={classes.rightSectionTitle}>Proposal deadline</h3>
              <h1 className={classes.rightSectionSubtitle}>3 days left</h1>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default AuctionHeader;
