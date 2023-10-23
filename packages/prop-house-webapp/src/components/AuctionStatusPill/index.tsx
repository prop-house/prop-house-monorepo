import { AuctionStatus } from '../../utils/auctionStatus';
import StatusPill, { StatusPillColor } from '../StatusPill';

const AuctionStatusPill: React.FC<{ status: AuctionStatus }> = props => {
  const { status } = props;

  let copy = '';
  let color: StatusPillColor;

  switch (status) {
    case AuctionStatus.AuctionNotStarted:
      copy = 'Not started';
      color = StatusPillColor.Gray;
      break;
    case AuctionStatus.AuctionEnded:
      copy = 'Ended';
      color = StatusPillColor.Gray;
      break;
    case AuctionStatus.AuctionAcceptingProps:
      copy = 'Proposing';
      color = StatusPillColor.Green;
      break;
    case AuctionStatus.AuctionVoting:
      copy = 'Voting';
      color = StatusPillColor.Purple;
      break;
  }

  return <StatusPill copy={copy} color={color} />;
};

export default AuctionStatusPill;
