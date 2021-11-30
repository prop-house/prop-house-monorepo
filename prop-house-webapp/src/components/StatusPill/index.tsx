import clsx from 'clsx';
import classes from './StatusPill.module.css';

export enum Status {
  AuctionNotStarted,
  AuctionAcceptingProps,
  AuctionVoting,
  AuctionEnded,
  ProposalWon,
}

const StatusPill: React.FC<{ status: Status }> = (props) => {
  const { status } = props;

  let copy = '';
  let bgClass = '';

  switch (status) {
    case Status.AuctionNotStarted:
      copy = 'Not started';
      bgClass = classes.greyBg;
      break;
    case Status.AuctionAcceptingProps:
      copy = 'Accepting proposals';
      bgClass = classes.greenBg;
      break;
    case Status.AuctionVoting:
      copy = 'Voting open';
      bgClass = classes.yellowBg;
      break;
    case Status.AuctionEnded:
      copy = 'Auction ended';
      bgClass = classes.greyBg;
      break;
    case Status.ProposalWon:
      copy = 'Winner';
      bgClass = classes.pinkBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusPill;
