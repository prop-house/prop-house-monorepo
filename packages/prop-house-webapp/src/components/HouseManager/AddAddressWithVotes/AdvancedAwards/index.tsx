// import classes from './AdvancedAwards.module.css';
import AddAwardByToken from '../AddAwardByToken';
import Group from '../Group';
import Text from '../Text';

const AdvancedAwards: React.FC<{ numOfAwards: number }> = props => {
  const { numOfAwards } = props;

  return (
    <>
      <Group>
        {[...Array(numOfAwards)].map((a, idx) => (
          <AddAwardByToken place={idx + 1} />
        ))}
      </Group>

      <Group>
        <Text type="link">Add more awards</Text>
      </Group>
    </>
  );
};

export default AdvancedAwards;
