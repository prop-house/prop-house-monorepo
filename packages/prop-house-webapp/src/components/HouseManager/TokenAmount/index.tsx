import classes from './TokenAmountInput.module.css';
import Text from '../Text';

const TokenAmountInput: React.FC<{}> = props => {
  return (
    <>
      <div className={classes.container}>
        <Text type="subtitle">Votes per token</Text>

        <div className={classes.awardInput}>
          <input value={10} type="text" />
        </div>
      </div>
    </>
  );
};

export default TokenAmountInput;
