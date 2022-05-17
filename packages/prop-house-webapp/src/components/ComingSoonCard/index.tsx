import { useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import classes from './ComingSoonCard.module.css';

const ComingSoonCard: React.FC<{ communityName?: string }> = (props) => {
  const { communityName } = props;
  const navigate = useNavigate();

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={classes.containerCard}
    >
      <div className={classes.content}>
        <h1 style={{ fontSize: '1.5rem' }}>Coming soon!</h1>
        <p style={{ marginBottom: '0' }}>
          <span>{communityName ? communityName : 'This community'}</span> does
          not yet have open Funding Rounds but will soon!
        </p>
      </div>
      <div className={classes.btnContainer}>
        <Button
          text="View houses"
          bgColor={ButtonColor.Green}
          onClick={() => navigate('/explore')}
        />
      </div>
    </Card>
  );
};

export default ComingSoonCard;
