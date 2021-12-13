import classes from './AuctionHeader.module.css';
import { Col, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import StatusPill, { StatusPillState } from '../StatusPill';
import { Link } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';

const AuctionHeader: React.FC<{
  auction: StoredAuction;
  displayCreateButton: boolean;
  status: StatusPillState;
}> = (props) => {
  const { displayCreateButton, status, auction } =
    props;

  const {
    id,
    startTime: startDate,
    amountEth: fundingAmount,
    proposalEndTime: proposalEndDate
  } = auction;

  return (
    <Row>
      <Col xl={12}>
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
        >
          <Row>
            <Col xl={5} md={12}>
              <div className={classes.leftSectionContainer}>
                <div className={classes.leftSectionTitle}>
                  {`Auction ${id}`}
                  <StatusPill status={status} />
                </div>

                <div className={classes.leftSectionSubtitle}>
                  {`${new Date(startDate).toDateString()} - ${new Date(
                    proposalEndDate
                  ).toDateString()}`}
                </div>
              </div>
            </Col>
            <Col
              xl={displayCreateButton ? 2 : { span: 2, offset: 1 }}
              md={12}
              className={classes.rightSectionSubsection}
            >
              <div className={classes.rightSectionTitle}>Funding</div>
              <div
                className={classes.rightSectionSubtitle}
              >{`${fundingAmount.toFixed(2)} Ξ`}</div>
            </Col>
            <Col xl={3} md={12} className={classes.rightSectionSubsection}>
              <div className={classes.rightSectionTitle}>Proposal deadline</div>
              <div className={classes.rightSectionSubtitle}>3 days left</div>
            </Col>
            {displayCreateButton && (
              <Col xl={2} className={classes.rightSectionSubsection}>
                <Link to="/create">
                  <Button text="Create" bgColor={ButtonColor.Pink} />
                </Link>
              </Col>
            )}
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default AuctionHeader;
