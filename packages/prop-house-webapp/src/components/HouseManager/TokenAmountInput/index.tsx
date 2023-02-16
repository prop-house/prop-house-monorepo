import classes from './TokenAmountInput.module.css';
import Text from '../Text';
import Input from '../Input';
import { InitialRoundProps } from '../../../state/slices/round';

const TokenAmountInput: React.FC<{
  numOfAwards: number;
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
}> = props => {
  const { numOfAwards, handleChange } = props;
  return (
    <>
      <div className={classes.container}>
        <Text type="subtitle">Votes per token</Text>

        <div className={classes.awardInput}>
          <Input
            placeholder="3"
            value={numOfAwards === 0 ? '' : numOfAwards}
            onChange={e => {
              handleChange('numWinners', e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TokenAmountInput;
