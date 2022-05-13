import Button, { ButtonColor } from '../Button';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './InactiveCommunityCTA.module.css';

const InactiveCommunityCTA: React.FC<{ communityName?: string }> = (props) => {
  const { communityName } = props;
  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={classes.containerCard}
    >
      <div className={classes.content}>
        <h1>Make use of your treasury</h1>
        <p>
          <span>{communityName ? communityName : 'This community'}</span> does
          not have an active Prop House yet. Deploy your treasury with your own
          Prop House to build long-term value for your community.
        </p>
      </div>
      <div className={classes.btnContainer}>
        <Button text="Apply now" bgColor={ButtonColor.Green} />
      </div>
    </Card>
  );
};

export default InactiveCommunityCTA;
