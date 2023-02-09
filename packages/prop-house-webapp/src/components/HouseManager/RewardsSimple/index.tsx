import classes from './RewardsSimple.module.css';

import Text from '../Text';
import Group from '../Group';
import Dropdown from '../Dropdown';
import clsx from 'clsx';
import Input from '../Input';

const RewardsSimple: React.FC<{}> = () => {
  const fundTypes = ['ETH', 'USDC', 'Nounlet'];

  return (
    <div className={classes.container}>
      <Group classNames={classes.inputContainer}>
        <Text type="subtitle">Winner</Text>
        <Input placeholder="3" value={''} onChange={() => {}} />
      </Group>

      <Group>
        <Group>
          <Text type="subtitle">will receive</Text>
        </Group>
      </Group>

      <Group classNames={classes.inputContainer}>
        <Text type="subtitle">Rewards</Text>
        <Input placeholder="3" value={''} onChange={() => {}} />
      </Group>

      <Group>
        <Dropdown values={fundTypes} classNames={clsx('houseManager', classes.dropdown)} />
      </Group>
    </div>
  );
};

export default RewardsSimple;
