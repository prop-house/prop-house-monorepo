import { Link } from 'react-router-dom';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './AllProposalsCTA.module.css';

const AllProposalsCTA = () => {
  return (
    <div className={classes.wrapper}>
      <Link to="/browse">
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          onHoverEffect={true}
        >
          <div>
            View all <span>20</span> proposals →
          </div>
        </Card>
      </Link>
    </div>
  );
};
export default AllProposalsCTA;
