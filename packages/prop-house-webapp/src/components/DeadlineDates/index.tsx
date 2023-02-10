import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import formatTime from '../../utils/formatTime';
import classes from './DeadlineDates.module.css';

const DeadlineDates: React.FC<{ round: StoredAuction }> = props => {
  const { round } = props;
  const { startTime, proposalEndTime, votingEndTime } = round;

  const notStarted = auctionStatus(round) === AuctionStatus.AuctionNotStarted;
  const proposing = auctionStatus(round) === AuctionStatus.AuctionAcceptingProps;
  const voting = auctionStatus(round) === AuctionStatus.AuctionVoting;

  const proposingStarts = formatTime(startTime);
  const proposingEnds = formatTime(proposalEndTime);
  const votingEnds = formatTime(votingEndTime);

  return (
    <div className={classes.date}>
      {proposing || notStarted
        ? `${proposingStarts} - ${proposingEnds}`
        : voting
        ? `${proposingEnds} - ${votingEnds}`
        : `${proposingStarts} - ${votingEnds}`}
    </div>
  );
};

export default DeadlineDates;
