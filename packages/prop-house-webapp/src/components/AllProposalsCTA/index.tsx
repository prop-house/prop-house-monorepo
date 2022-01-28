import { Link } from 'react-router-dom';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './AllProposalsCTA.module.css';

const AllProposalsCTA: React.FC<{
  numProposals: number;
  auctionId: number;
}> = (props) => {
  const { numProposals, auctionId } = props;
  return (
    <div className={classes.wrapper}>
      <Link to={`auction/${auctionId}`}>
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          onHoverEffect={true}
        >
          <div>
            View all <span>{numProposals}</span> proposals →
          </div>
        </Card>
      </Link>
    </div>
  );
};
export default AllProposalsCTA;
