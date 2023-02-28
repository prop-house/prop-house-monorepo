import Text from '../Text';
import classes from './AwardHeader.module.css';
import Bullet from '../Bullet';
import AwardWithPlace from '../AwardWithPlace';

const AwardHeader: React.FC<{ place: number }> = props => {
  const { place } = props;

  return (
    <div className={classes.container}>
      <div className={classes.award}>
        <AwardWithPlace place={place} />
      </div>

      <Bullet />

      <Text type="link" onClick={() => {}}>
        clear
      </Text>
    </div>
  );
};

export default AwardHeader;
