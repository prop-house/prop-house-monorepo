import Text from '../Text';
import getNumberWithOrdinal from '../../../utils/getNumberWithOrdinal';
import classes from './AwardHeader.module.css';
import Bullet from '../Bullet';

const AwardHeader: React.FC<{ place: number }> = props => {
  const { place } = props;

  const getAwardEmoji = (place: number) => {
    switch (place) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return place;
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.award}>
        {place > 3 ? (
          <div className={classes.placeCircle}>
            <span className={classes.place}>{place}</span>
          </div>
        ) : (
          <Text type="subtitle">{getAwardEmoji(place)}</Text>
        )}

        <Text type="subtitle">{getNumberWithOrdinal(place)} place</Text>
      </div>

      <Bullet />

      <Text type="link" onClick={() => {}}>
        clear
      </Text>
    </div>
  );
};

export default AwardHeader;
