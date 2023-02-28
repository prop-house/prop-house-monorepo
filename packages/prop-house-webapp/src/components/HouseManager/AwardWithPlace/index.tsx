import classes from './AwardWithPlace.module.css';
import Text from '../Text';
import getNumberWithOrdinal from '../../../utils/getNumberWithOrdinal';
import { getAwardEmoji } from '../utils/getAwardEmoji';

const AwardWithPlace: React.FC<{ place: number }> = props => {
  const { place } = props;

  return (
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
  );
};

export default AwardWithPlace;
