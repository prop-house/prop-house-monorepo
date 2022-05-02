import classes from './AuctionHeader.module.css';
import { Col, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import StatusPill from '../StatusPill';
import { Link, useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import formatTime from '../../utils/formatTime';
import {
  auctionStatus,
  AuctionStatus,
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
  totalVotes?: number;
  votesLeft?: number;
  handleVote?: () => void;
}> = (props) => {
  const { auction, clickable, classNames, totalVotes, votesLeft, handleVote } =
    props;

  const navigate = useNavigate();
  const location = useLocation();
  const onAuctionPage = location.pathname.includes('auction'); // disable clickable header when browsing auctions
  const status = auctionStatus(auction);

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
        <Col lg={4} className={classes.leftSectionContainer}>
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
        <Col lg={8} className={classes.infoSection}>
          {status === AuctionStatus.AuctionVoting &&
            totalVotes &&
            totalVotes > 0 && (
              <div className={classes.infoSubsection}>
                <div className={classes.infoSubsectionTitle}>Votes left</div>
                <div
                  className={classes.infoSubsectionContent}
                >{`${votesLeft} of ${totalVotes}`}</div>
              </div>
            )}

          <div className={classes.infoSubsection}>
            <div className={classes.infoSubsectionTitle}>Funding</div>
            <div className={classes.infoSubsectionContent}>
              {`${fundingAmount.toFixed(2)} Ξ `}
              <span>x {numWinners}</span>
            </div>
          </div>
          <div className={classes.infoSubsection}>
            <div className={classes.infoSubsectionTitle}>
              {deadlineCopy(auction)}
            </div>
            <div className={classes.infoSubsectionContent}>
              {diffTime(deadlineTime(auction))}
            </div>
          </div>
          {status === AuctionStatus.AuctionAcceptingProps ? (
            <div className={classes.infoSubsection}>
              <Button
                text="Propose"
                bgColor={ButtonColor.Pink}
                onClick={() => navigate('/create')}
              />
            </div>
          ) : (
            status === AuctionStatus.AuctionVoting &&
            totalVotes &&
            totalVotes > 0 && (
              <div className={classes.infoSubsection}>
                <Button
                  text="Vote"
                  disabled={votesLeft && votesLeft > 0 ? false : true}
                  bgColor={ButtonColor.Yellow}
                  onClick={handleVote}
                />
              </div>
            )
          )}
        </Col>
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
