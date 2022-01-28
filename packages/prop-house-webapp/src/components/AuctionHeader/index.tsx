import classes from './AuctionHeader.module.css';
import { Col, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import StatusPill from '../StatusPill';
import { Link } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import formatTime from '../../utils/formatTime';
import isAuctionClosed from '../../utils/isAuctionClosed';
import auctionStatus from '../../utils/auctionStatus';
import { useLocation } from 'react-router-dom';

const AuctionHeader: React.FC<{
  auction: StoredAuction;
}> = (props) => {
  const { auction } = props;
  const isClosed = isAuctionClosed(auction);
  const displayCreateButton = !isClosed;

  const location = useLocation();
  const onAuctionPage = location.pathname.includes('auction'); // disable clickable header when browsing auctions

  const {
    id,
    startTime: startDate,
    amountEth: fundingAmount,
    proposalEndTime: proposalEndDate,
    votingEndTime: votingEndDate,
  } = auction;

  const content = (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      onHoverEffect={!onAuctionPage}
    >
      <Row>
        <Col xl={5} md={12} className={classes.leftSectionContainer}>
          <div className={classes.leftSectionTitle}>
            {!onAuctionPage ? (
              <Link to={`/auction/${id}`}>{`Auction ${id}`}</Link>
            ) : (
              `Auction ${id}`
            )}
            <StatusPill
              status={auctionStatus(startDate, proposalEndDate, votingEndDate)}
            />
          </div>

          <div className={classes.leftSectionSubtitle}>
            <span title={startDate.toLocaleString()}>
              {formatTime(startDate)}
            </span>
            {' - '}
            <span title={proposalEndDate.toLocaleString()}>
              {formatTime(proposalEndDate)}
            </span>
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
          <div className={classes.rightSectionSubtitle}>
            {diffTime(auction.proposalEndTime)}
          </div>
        </Col>
        {displayCreateButton && (
          <Col xl={2} className={classes.rightSectionSubsection}>
            <Link to="/create">
              <Button text="Create Proposal" bgColor={ButtonColor.Pink} />
            </Link>
          </Col>
        )}
      </Row>
    </Card>
  );

  return (
    <Row>
      <Col xl={12}>
        {!onAuctionPage ? <Link to={`auction/${id}`}>{content}</Link> : content}
      </Col>
    </Row>
  );
};

export default AuctionHeader;
