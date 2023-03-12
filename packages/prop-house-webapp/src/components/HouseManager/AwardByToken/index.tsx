import classes from './AwardByToken.module.css';
import { NewRound } from '../../../state/slices/round';
import Button, { ButtonColor } from '../../Button';
import { AwardProps } from '../AwardsSelector';
import Group from '../Group';
import trimEthAddress from '../../../utils/trimEthAddress';
import clsx from 'clsx';
import AwardWithPlace from '../AwardWithPlace';
import Bullet from '../Bullet';
import Text from '../Text';

const AwardByToken: React.FC<{
  award: AwardProps;
  place: number;
  disabled: boolean;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleBlur: (award: AwardProps) => void;
  handleRemove: (award: AwardProps) => void;
  handleClear(address: AwardProps): void;
  handleInputChange: (address: AwardProps, value: string) => void;
  handleInputTypeChange: (address: AwardProps) => void;
}> = props => {
  const {
    place,
    award,
    disabled,
    isTyping,
    setIsTyping,
    handleBlur,
    handleClear,
    handleRemove,
    handleInputChange,
    handleInputTypeChange,
  } = props;

  // Handle change event on award input
  const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const newValue = e.target.value;

    handleInputChange(award, newValue);
  };

  const inputHasError = award.state === 'Error';

  // Error states
  const getErrorMessage = () => {
    switch (award.errorType) {
      case 'AddressNotFound':
        return 'Invalid address';
      case 'UnidentifiedContract':
        return 'Unidentified contract';
      // TODO: more errors
      default:
        return 'Error';
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.addressAndPlace}>
        <Group row mb={4}>
          <div className={classes.award}>
            <AwardWithPlace place={place} />
          </div>

          <Bullet />

          <Text type="link" disabled={award.state !== 'Success'} onClick={() => handleClear(award)}>
            clear
          </Text>
        </Group>

        <Group gap={6} classNames={classes.fullWidth}>
          <div className={classes.awardContainer}>
            <Group gap={4} classNames={classes.addressAndTitle}>
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

      <div className={classes.inputContainer}>
        <div className={classes.awardInput}>
          <input
            placeholder="0"
            value={award.amount}
            // TODO: fix funding amount input
            // onChange={e => {
            //   handleChange('fundingAmount', e.target.value);
            // }}
          />
        </div>
      </div>

      <Button
        text="X"
        classNames={classes.xButton}
        bgColor={ButtonColor.White}
        onClick={() => handleRemove(award)}
        disabled={disabled}
      />
    </div>
  );
};

export default AwardByToken;
