// import classes from './RewardsAdvanced.module.css';
import { useState } from 'react';
import { InitialRoundProps } from '../../../state/slices/round';
import AddAwardByToken from '../AddAwardByToken';
import { AwardProps } from '../AwardsSelector';
import Group from '../Group';
import Text from '../Text';

const RewardsAdvanced: React.FC<{
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  numOfAwards: number;
  awardContracts: AwardProps[];
}> = props => {
  const {
    handleChange,
    numOfAwards,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    awardContracts,
  } = props;

  const [customRewards, setCustomRewards] = useState([{}, {}, {}]);

  const handleRemove = (index: number) => {
    setCustomRewards(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handleAdd = () => {
    setCustomRewards(prevItems => [...prevItems, {}]);
  };
  return (
    <>
      <Group>
        {customRewards.map((a, idx) => (
          <>
            <AddAwardByToken
              numOfAwards={numOfAwards}
              handleChange={handleChange}
              place={idx + 1}
              onClick={() => handleRemove(idx)}
              oneRewardLeft={customRewards.length === 1}
            />
          </>
        ))}
      </Group>

      <Group>
        <Text type="link" onClick={handleAdd}>
          Add more awards
        </Text>
      </Group>
    </>
  );
};

export default RewardsAdvanced;
