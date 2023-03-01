import classes from './RewardsSimple.module.css';
import Text from '../Text';
import Group from '../Group';
import { InitialRoundProps } from '../../../state/slices/round';
import clsx from 'clsx';
import Bullet from '../Bullet';
import trimEthAddress from '../../../utils/trimEthAddress';
import { capitalize } from '../../../utils/capitalize';
import { AwardProps } from '../AwardsSelector';

const RewardsSimple: React.FC<{
  round: InitialRoundProps;
  award: AwardProps;

  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleAmountInputChange: (e: React.ChangeEvent<HTMLInputElement>, award: AwardProps) => void;
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
    isTyping,
    award,
    round,
    setIsTyping,
    handleChange,
    handleAmountInputChange,
    handleBlur,
    handleClear,
    handleInputTypeChange,
    handleInputChange,
  } = props;

  // Handle change event on award input
  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const newValue = e.target.value;

    handleInputChange(award, newValue);
  };

  const handleWinnerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;

    // If the value is greater than 5 digits, truncate it to first 5 digits
    // ie. 1234 -> 123
    if (value.toString().length > 3) value = Number(value.toString().substring(0, 3));

    handleChange('numWinners', value);

    // const updated = changeAward(award.id, awardContracts, { ...awardContracts, amount: value });
    // dispatch(
    //   updateRound({
    //     ...round,
    //     fundingAmount: value,
    //     awards: updated,
    //   }),
    // );

    // dispatch(checkStepCriteria());
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    let value = parseInt(clipboardData, 10);

    if (isNaN(value) || value < 1) {
      e.preventDefault();
      return;
    }
  };

  const inputHasError = award.state === 'Error';

  // Error states
  const getErrorMessage = () => {
    switch (award.errorType) {
      case 'AddressNotFound':
        return 'Invalid address';
      case 'UnidentifiedContract':
        return 'Unidentified contract';
      default:
        return 'Error';
    }
  };

  return (
    <div className={classes.container}>
      <Group gap={4} classNames={classes.inputContainer}>
        <Text type="subtitle">Winner(s)</Text>
        <input
          type="number"
          placeholder="3"
          maxLength={3}
          value={round.numWinners === 0 ? '' : round.numWinners}
          onChange={handleWinnerInputChange}
        />
      </Group>

      <Group mb={8}>
        <Text type="subtitle">will receive</Text>
      </Group>

      <Group gap={4} classNames={classes.inputContainer}>
        <Text type="subtitle">Rewards</Text>
        <input
          type="number"
          maxLength={5}
          placeholder="0.5"
          value={round.fundingAmount === 0 ? undefined : round.fundingAmount}
          onPaste={handleInputPaste}
          onChange={e => handleAmountInputChange(e, award)}
        />
      </Group>

      <Group gap={6} classNames={classes.fullWidth}>
        <div className={classes.awardContainer}>
          <Group gap={4} classNames={classes.addressAndTitle}>
            <Group row>
              <Text type="subtitle">{capitalize(award.type)} Address</Text>
              <Bullet />

              <Text
                type="link"
                onClick={() => handleClear(award)}
                disabled={award.state !== 'Success'}
              >
                clear
              </Text>
            </Group>

            {(award.state === 'Input' || inputHasError) && (
              <div className={classes.addressContainer}>
                <input
                  className={clsx(
                    classes.addressInput,
                    award.state === 'Error' && classes.addressInputError,
                  )}
                  type="text"
                  value={award.address}
                  onBlur={() => handleBlur(award)}
                  onKeyPress={event => event.key === 'Enter' && handleBlur(award)}
                  onChange={handleInputValueChange}
                  placeholder={'ex: 0x1234567890ABCDEF1234567890ABCDEF12345678'}
                />
              </div>
            )}

            {/* //TODO: remove */}
            {/* {award.state === 'Searching' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{trimEthAddress(award.address)}</div>
              <div>Searching...</div>
            </div>
          )} */}

            {award.state === 'Success' && (
              <button
                className={classes.addressSuccess}
                onClick={() => handleInputTypeChange(award)}
              >
                {/* Show award contract image and name */}
                <div className={classes.addressImgAndTitle}>
                  <img src={award.image} alt={award.name} />

                  <span>{award.name}</span>
                </div>

                <div>{trimEthAddress(award.address)}</div>
              </button>
            )}
          </Group>
        </div>

        {award.state === 'Error' && !isTyping && (
          <Group mt={-8}>
            <p className={classes.error}>{getErrorMessage()}</p>
          </Group>
        )}
      </Group>
    </div>
  );
};

export default RewardsSimple;
