import classes from './AwardInput.module.css';
import clsx from 'clsx';
import { capitalize } from '../../../utils/capitalize';
import trimEthAddress from '../../../utils/trimEthAddress';
import Group from '../Group';
import Text from '../Text';
import Bullet from '../Bullet';
import { AwardProps } from '../SetTheAwards';

const AwardInput: React.FC<{
  award: AwardProps;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleClear(award: AwardProps): void;
  handleChange: (award: AwardProps, value: string) => void;
  handleBlur: (award: AwardProps) => void;
  handleInputTypeChange: (award: AwardProps) => void;
  placeholder?: string;
}> = props => {
  const {
    award,
    isTyping,
    setIsTyping,
    handleClear,
    handleChange,
    handleBlur,
    handleInputTypeChange,
    placeholder,
  } = props;

  // Handle change event on address input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const newValue = e.target.value;

    handleChange(award, newValue);
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
    <>
      <div className={classes.container}>
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
                value={award.addressValue}
                onBlur={() => handleBlur(award)}
                onKeyPress={event => event.key === 'Enter' && handleBlur(award)}
                onChange={handleInputChange}
                placeholder={
                  placeholder ? placeholder : 'ex: 0x1234567890ABCDEF1234567890ABCDEF12345678'
                }
              />
            </div>
          )}

          {/* {award.state === 'Searching' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{trimEthAddress(award.addressValue)}</div>
              <div>Searching...</div>
            </div>
          )} */}

          {award.state === 'Success' && (
            <button className={classes.addressSuccess} onClick={() => handleInputTypeChange(award)}>
              {/* Show award contract image and name */}
              <div className={classes.addressImgAndTitle}>
                <img src={award.addressImage} alt={award.addressName} />

                <span>{award.addressName}</span>
              </div>

              <div>{trimEthAddress(award.addressValue)}</div>
            </button>
          )}
        </Group>
      </div>

      {award.state === 'Error' && !isTyping && (
        <Group mt={-10}>
          <p className={classes.error}>{getErrorMessage()}</p>
        </Group>
      )}
    </>
  );
};

export default AwardInput;
