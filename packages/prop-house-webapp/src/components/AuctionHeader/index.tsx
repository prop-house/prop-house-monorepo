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
import auctionStatus, {
  deadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import { useLocation } from 'react-router-dom';

/**
 * @param clickable sets the entire card to be a button to click through to the round's page
 */
const AuctionHeader: React.FC<{
  auction: StoredAuction;
  clickable: boolean;
  classNames?: string | string[];
}> = (props) => {
  const { auction, clickable, classNames } = props;
  const isClosed = isAuctionClosed(auction);
  const displayCreateButton = !isClosed;

  const location = useLocation();
  const onAuctionPage = location.pathname.includes('auction'); // disable clickable header when browsing auctions

  const {
    id,
    startTime: startDate,
    amountEth: fundingAmount,
    numWinners,
    proposalEndTime: proposalEndDate,
  } = auction;

  const content = (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      onHoverEffect={clickable}
      classNames={classNames}
    >
      <Row>
        <Col md={5} className={classes.leftSectionContainer}>
          <div className={classes.leftSectionTitle}>
            {!onAuctionPage ? (
              <Link to={`/auction/${id}`}>{`Funding round ${id}`}</Link>
            ) : (
              `Funding round ${id}`
            )}
            <StatusPill status={auctionStatus(auction)} />
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
        <Col md={displayCreateButton ? 5 : 6} className={classes.subsection}>
          <div className={classes.infoSubsection}>
            <div className={classes.rightSectionTitle}>Funding</div>
            <div className={classes.rightSectionSubtitle}>
              {`${fundingAmount.toFixed(2)} Ξ `}
              <span>x {numWinners}</span>
            </div>
          </div>
          <div className={classes.infoSubsection}>
            <div className={classes.rightSectionTitle}>
              {deadlineCopy(auction)}
            </div>
            <div className={classes.rightSectionSubtitle}>
              {diffTime(deadlineTime(auction))}
            </div>
          </div>
        </Col>

        {displayCreateButton && (
          <Col md={2} className={classes.rightSectionSubsection}>
            <Link to="/create">
              <Button text="Propose" bgColor={ButtonColor.Pink} />
            </Link>
          </Col>
        )}
      </Row>
    </Card>
  );

  return (
    <Row>
      <Col xl={12}>
        {!onAuctionPage && clickable ? (
          <Link to={`auction/${id}`}>{content}</Link>
        ) : (
          content
        )}
      </Col>
    </Row>
  );
};

export default AuctionHeader;
