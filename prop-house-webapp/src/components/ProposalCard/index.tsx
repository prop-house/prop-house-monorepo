import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link } from 'react-router-dom';

const ProposalCard = () => {
  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <div className={classes.author}>
        pixelz.eth <span>proposed</span>
      </div>
      <div className={classes.title}>
        Commission Jonathan Mann to create a song for every 10th Noun!
      </div>
      <div className={classes.bottomContainer}>
        <div className={classes.timestamp}>3 hours ago</div>
        <div className={classes.readMore}>
          <Link to="/">Read more →</Link>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCard;
