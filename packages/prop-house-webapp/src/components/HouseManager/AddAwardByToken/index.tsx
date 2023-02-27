import classes from './AddAwardByToken.module.css';
// import Address from '../Address';
import XButton from '../XButton';
import AwardHeader from '../AwardHeader';
import TokenAmountInput from '../TokenAmountInput';
import { InitialRoundProps } from '../../../state/slices/round';
import AwardInput from '../AwardInput';

const AddAwardByToken: React.FC<{
  place: number;
  onClick: any;
  oneRewardLeft: boolean;
  numOfAwards: number;
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
}> = props => {
  const { place, onClick, oneRewardLeft, numOfAwards, handleChange } = props;

  return (
    <div className={classes.container}>
      <div className={classes.addressAndPlace}>
        <AwardHeader place={place} />
        {/* <AwardInput
          award={{}}
          isTyping={false}
          setIsTyping={() => {}}
          handleClear={() => {}}
          handleChange={() => {}}
          handleBlur={() => {}}
          handleInputTypeChange={() => {}}
        /> */}
      </div>

      <TokenAmountInput handleChange={handleChange} numOfAwards={numOfAwards} />

      <XButton handleClick={onClick} disabled={oneRewardLeft} />
    </div>
  );
};

export default AddAwardByToken;
