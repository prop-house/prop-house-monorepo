import clsx from 'clsx';
import classes from './StatusPill.module.css';
import { AuctionStatus } from '../../utils/auctionStatus';

const StatusPill: React.FC<{ status: AuctionStatus }> = (props) => {
  const { status } = props;

  let copy = '';
  let bgClass = '';

  switch (status) {
    case AuctionStatus.AuctionNotStarted:
      copy = 'Not started';
      bgClass = classes.greyBg;
      break;
    case AuctionStatus.AuctionAcceptingProps:
      copy = 'Accepting proposals';
      bgClass = classes.greenBg;
      break;
    case AuctionStatus.AuctionVoting:
      copy = 'Voting open';
      bgClass = classes.yellowBg;
      break;
    case AuctionStatus.AuctionEnded:
      copy = 'Auction ended';
      bgClass = classes.greyBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusPill;
