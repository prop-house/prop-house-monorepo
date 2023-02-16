import classes from './RewardsSimple.module.css';
import Text from '../Text';
import Group from '../Group';
import Address from '../Address';
import { InitialRoundProps } from '../../../state/slices/round';

const RewardsSimple: React.FC<{
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  round: InitialRoundProps;
}> = props => {
  const { handleChange, round } = props;

  return (
    <div className={classes.container}>
      <Group gap={6} classNames={classes.inputContainer}>
        <Text type="subtitle">Winner(s)</Text>
        <input
          type="number"
          autoFocus
          placeholder="3"
          value={round.numWinners === 0 ? '' : round.numWinners}
          onChange={e => {
            handleChange('numWinners', Number(e.target.value));
          }}
        />
      </Group>

      <Group mb={8}>
        <Text type="subtitle">will receive</Text>
      </Group>

      <Group gap={6} classNames={classes.inputContainer}>
        <Text type="subtitle">Rewards</Text>
        <input
          type="number"
          placeholder="0.5"
          value={round.fundingAmount === 0 ? '' : round.fundingAmount}
          onChange={e => {
            handleChange('fundingAmount', Number(e.target.value));
          }}
        />
      </Group>

      <Group gap={6} classNames={classes.fullWidth}>
        <Text type="subtitle">Contract Address</Text>

        <Address placeholder="ex: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03" />
      </Group>
    </div>
  );
};

export default RewardsSimple;
