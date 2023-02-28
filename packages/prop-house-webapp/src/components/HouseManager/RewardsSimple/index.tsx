import classes from './RewardsSimple.module.css';
import Text from '../Text';
import Group from '../Group';
import { InitialRoundProps } from '../../../state/slices/round';
import { AwardProps } from '../SetTheAwards';
import clsx from 'clsx';
import Bullet from '../Bullet';
import trimEthAddress from '../../../utils/trimEthAddress';
import { capitalize } from '../../../utils/capitalize';

const RewardsSimple: React.FC<{
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleBlur: (award: AwardProps) => void;
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  round: InitialRoundProps;
  award: AwardProps;
  handleClear(address: AwardProps): void;
  handleInputChange: (address: AwardProps, value: string) => void;
  handleInputTypeChange: (address: AwardProps) => void;
}> = props => {
  const {
    isTyping,
    setIsTyping,
    round,
    handleChange,
    handleBlur,
    award,
    handleClear,
    handleInputTypeChange,
    handleInputChange,
  } = props;

  // Handle change event on address input
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
          autoFocus
          placeholder="3"
          maxLength={3}
          value={round.numWinners === 0 ? '' : round.numWinners}
          onChange={e => {
            handleChange('numWinners', Number(e.target.value));
          }}
        />
      </Group>

      <Group mb={8}>
        <Text type="subtitle">will receive</Text>
      </Group>

      <Group gap={4} classNames={classes.inputContainer}>
        <Text type="subtitle">Rewards</Text>
        <input
          type="number"
          maxLength={3}
          placeholder="0.5"
          value={round.fundingAmount === 0 ? '' : round.fundingAmount}
          onChange={e => {
            handleChange('fundingAmount', Number(e.target.value));
          }}
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
              <div>{trimEthAddress(award.addressValue)}</div>
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
