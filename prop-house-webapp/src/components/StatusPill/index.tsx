import clsx from 'clsx';
import classes from './StatusPill.module.css';

export enum StatusPillState {
  AuctionNotStarted,
  AuctionAcceptingProps,
  AuctionVoting,
  AuctionEnded,
  ProposalWon,
}

const StatusPill: React.FC<{ status: StatusPillState }> = (props) => {
  const { status } = props;

  let copy = '';
  let bgClass = '';

  switch (status) {
    case StatusPillState.AuctionNotStarted:
      copy = 'Not started';
      bgClass = classes.greyBg;
      break;
    case StatusPillState.AuctionAcceptingProps:
      copy = 'Accepting proposals';
      bgClass = classes.greenBg;
      break;
    case StatusPillState.AuctionVoting:
      copy = 'Voting open';
      bgClass = classes.yellowBg;
      break;
    case StatusPillState.AuctionEnded:
      copy = 'Auction ended';
      bgClass = classes.greyBg;
      break;
    case StatusPillState.ProposalWon:
      copy = 'Winner';
      bgClass = classes.pinkBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusPill;
