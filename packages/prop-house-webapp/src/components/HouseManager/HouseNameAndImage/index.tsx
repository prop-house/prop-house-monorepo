import classes from './HouseManager.module.css';
import { useAppSelector } from '../../../hooks';
import { buildImageURL } from '../../../utils/buildImageURL';
import Text from '../Text';
import Group from '../Group';

const HouseNameAndImage = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <Group row gap={6}>
      <img
        src={buildImageURL(round.house.image)}
        alt="house"
        className={classes.img}
      />
      <Text type="title">{round.house.title}</Text>
    </Group>
  );
};

export default HouseNameAndImage;
