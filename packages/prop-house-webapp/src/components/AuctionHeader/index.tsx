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
import { HiArrowSmLeft, HiArrowSmRight } from 'react-icons/hi';

/**
 * @param clickable sets the entire card to be a button to click through to the round's page
 */
const AuctionHeader: React.FC<{
  auction: StoredAuction;
  clickable: boolean;
  classNames?: string | string[];
  totalVotes?: number;
  voteBtnEnabled?: boolean;
  votesLeft?: number;
  handleVote?: () => void;
  isFirstOrLastAuction: () => [boolean, boolean];
  handleAuctionChange: (next: boolean) => void;
}> = (props) => {
  const {
    auction,
    clickable,
    classNames,
    totalVotes,
    votesLeft,
    handleVote,
    voteBtnEnabled,
    isFirstOrLastAuction,
    handleAuctionChange,
  } = props;

  console.log('from auction header: ', isFirstOrLastAuction()[1]);

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
      <div className={classes.row}>
        <div className={classes.leftSectionContainer}>
          <div className={classes.arrowsContainer}>
            <HiArrowSmLeft
              size={'2rem'}
              onClick={() => handleAuctionChange(false)}
              className={
                isFirstOrLastAuction()[0] ? classes.disable : classes.able
              }
            />
            <HiArrowSmRight
              size={'2rem'}
              onClick={() => handleAuctionChange(true)}
              className={
                isFirstOrLastAuction()[1] ? classes.disable : classes.able
              }
            />
          </div>
          <div className={classes.titleSectionContainer}>
            <div className={classes.leftSectionTitle}>
              {!onAuctionPage ? (
                <Link to={`/auction/${id}`}>{auction.title}</Link>
              ) : (
                auction.title
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
          </div>
        </div>
        <div className={classes.infoSection}>
          {status === AuctionStatus.AuctionVoting &&
            totalVotes !== undefined &&
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
            totalVotes !== undefined &&
            totalVotes > 0 && (
              <div className={classes.infoSubsection}>
                <Button
                  text="Vote"
                  disabled={voteBtnEnabled ? false : true}
                  bgColor={ButtonColor.Yellow}
                  onClick={handleVote}
                />
              </div>
            )
          )}
        </div>
      </div>
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
