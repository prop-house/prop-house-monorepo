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
        <h1 style={{ fontSize: '1.5rem' }}>
          Supercharge your nounish community
        </h1>
        <p style={{ marginBottom: '0' }}>
          <span>{communityName ? communityName : 'This community'}</span> does
          not have an active Prop House yet. Deploy capital with your own Prop
          House to build long-term value for your community.
        </p>
      </div>
      <div className={classes.btnContainer}>
        <a
          href="https://www.addressform.io/form/1fa6ca57-60e2-4a16-aee4-37e1adabb0f7"
          target="_blank"
          rel="noreferrer"
        >
          <Button text="Reach out" bgColor={ButtonColor.Green} />
        </a>
      </div>
    </Card>
  );
};

export default InactiveCommunityCTA;
