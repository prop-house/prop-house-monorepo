// import classes from './RewardsAdvanced.module.css';
import { InitialRoundProps } from '../../../state/slices/round';
import AwardByToken from '../AwardByToken';
import { AwardProps } from '../AwardsSelector';
import Group from '../Group';
import Text from '../Text';

const RewardsAdvanced: React.FC<{
  awards: AwardProps[];
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleAdd: () => void;
  handleRemove: (award: AwardProps) => void;
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  handleBlur: (award: AwardProps) => void;
  handleClear(address: AwardProps): void;
  handleInputChange: (address: AwardProps, value: string) => void;
  handleInputTypeChange: (address: AwardProps) => void;
}> = props => {
  const {
    awards,
    isTyping,
    setIsTyping,
    handleAdd,
    handleRemove,
    handleChange,
    handleBlur,
    handleClear,
    handleInputTypeChange,
    handleInputChange,
  } = props;

  return (
    <>
      <Group mb={12} gap={12}>
        {/* {(round.awards.length > 1 ? awards : [...Array(3)]).map((a, idx) => ( */}
        {awards.map((a, idx) => (
          <AwardByToken
            // award={
            //   round.awards.length > 1
            //     ? a
            //     : {
            //         id: uuid(),
            //         type: 'contract',
            //         address: '',
            //         image: '',
            //         name: '',
            //         symbol: '',
            //         state: 'Input',
            //       }
            // }
            award={a}
            place={idx + 1}
            isTyping={isTyping}
            disabled={awards.length === 1}
            setIsTyping={setIsTyping}
            handleBlur={handleBlur}
            handleRemove={handleRemove}
            handleClear={handleClear}
            handleChange={handleChange}
            handleInputChange={handleInputChange}
            handleInputTypeChange={handleInputTypeChange}
          />
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
