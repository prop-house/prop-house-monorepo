import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './ProposalCard.module.css';

const ProposalCard = () => {
  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <div className={classes.timestamp}>3 hours ago</div>
      <div className={classes.title}>
        Commission Jonathan Mann to create a song for every 10th Noun!
      </div>
      <div className={classes.author}>pixelz.eth</div>
    </Card>
  );
};

export default ProposalCard;
