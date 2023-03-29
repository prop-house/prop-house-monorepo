import classes from './Address.module.css';
import clsx from 'clsx';
import Group from '../Group';
import Text from '../Text';
import Bullet from '../Bullet';
import { NewStrategy } from '../StrategiesConfig';
import EthAddress from '../../EthAddress';
import trimEthAddress from '../../../utils/trimEthAddress';
import { VotingStrategyType } from '@prophouse/sdk';

const Address: React.FC<{
  isTyping: boolean;
  strategy: NewStrategy;
  placeholder?: string;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
  handleClear: () => void;
}> = props => {
  const { strategy, isTyping, handleClear, handleBlur, handleSwitch, handleChange, placeholder } =
    props;

  const verifiedAddress = strategy.state === 'success';

  return (
    <>
      <div className={classes.container}>
        <Group gap={4} classNames={classes.addressAndTitle}>
          <Group row>
            <Text type="subtitle">
              {strategy.type === VotingStrategyType.WHITELIST ? 'Wallet' : 'Contract'} Address
            </Text>

            {verifiedAddress && (
              <>
                <Bullet />
                <Text type="link" onClick={handleClear} classNames={classes.clear}>
                  clear
                </Text>
              </>
            )}
          </Group>

          <Group>
            {verifiedAddress ? (
              <button className={classes.addressSuccess} onClick={handleSwitch}>
                {strategy.type === VotingStrategyType.WHITELIST ? (
                  <EthAddress address={strategy.address} addAvatar />
                ) : (
                  <div className={classes.addressImgAndTitle}>
                    <img src={strategy.image} alt={strategy.name} />

                    <span>{strategy.name}</span>
                  </div>
                )}

                <div>{trimEthAddress(strategy.address)}</div>
              </button>
            ) : (
              <div className={classes.addressContainer}>
                <input
                  className={clsx(
                    classes.addressInput,
                    strategy.state === 'error' && classes.addressInputError,
                  )}
                  type="text"
                  value={strategy.address}
                  onBlur={handleBlur}
                  onKeyDown={e => e.key === 'Enter' && handleBlur()}
                  onChange={e => handleChange(e.target.value)}
                  placeholder={
                    placeholder ? placeholder : 'ex: 0x1234567890ABCDEF1234567890ABCDEF12345678'
                  }
                />
              </div>
            )}
          </Group>
        </Group>

        {strategy.state === 'error' && !isTyping && (
          <Group mt={-5}>
            <p className={classes.error}>{strategy.error}</p>
          </Group>
        )}
      </div>
    </>
  );
};

export default Address;
