import Button, { ButtonColor } from '../Button';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './InactiveCTA.module.css';

const InactiveCTA = () => {
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
          Interested in running your own community Prop House? Reach out to see
          how we can work together to make it happen!
        </p>
      </div>
      <div className={classes.btnContainer}>
        <a
          href="https://www.addressform.io/form/1fa6ca57-60e2-4a16-aee4-37e1adabb0f7"
          target="_blank"
          rel="noreferrer"
        >
          <Button text="Contact us" bgColor={ButtonColor.Green} />
        </a>
      </div>
    </Card>
  );
};

export default InactiveCTA;
