import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './ManagerSecondaryCard.module.css';

const ManagerSecondaryCard = () => {
  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.secondaryCard}
      >
        <p>Create your House</p>
      </Card>
    </>
  );
};

export default ManagerSecondaryCard;
