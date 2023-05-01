import classes from './VoterAddress.module.css';
import clsx from 'clsx';
import Group from '../Group';
import Text from '../Text';
import Bullet from '../Bullet';
import { NewVoter } from '../VotersConfig';
import EthAddress from '../../EthAddress';
import trimEthAddress from '../../../utils/trimEthAddress';
import { VotingStrategyType } from '@prophouse/sdk-react';

const VoterAddress: React.FC<{
  isTyping: boolean;
  voter: NewVoter;
  placeholder?: string;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
  handleClear: () => void;
}> = props => {
  const { voter, isTyping, handleClear, handleBlur, handleSwitch, handleChange, placeholder } =
    props;

  const verifiedAddress = voter.state === 'success';

  return (
    <>
      <div className={classes.container}>
        <Group gap={4} classNames={classes.addressAndTitle}>
          <Group row>
            <Text type="subtitle">
              {voter.type === VotingStrategyType.WHITELIST ? 'Wallet' : 'Contract'} Address
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
                {voter.type === VotingStrategyType.WHITELIST ? (
                  <EthAddress address={voter.address} addAvatar />
                ) : (
                  <div className={classes.addressImgAndTitle}>
                    <img src={voter.image} alt={voter.name} />

                    <span>{voter.name}</span>
                  </div>
                )}

                <div>{trimEthAddress(voter.address)}</div>
              </button>
            ) : (
              <div className={classes.addressContainer}>
                <input
                  className={clsx(
                    classes.addressInput,
                    voter.state === 'error' && classes.addressInputError,
                  )}
                  type="text"
                  value={voter.address}
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

        {voter.state === 'error' && !isTyping && (
          <Group mt={-5}>
            <p className={classes.error}>{voter.error}</p>
          </Group>
        )}
      </div>
    </>
  );
};

export default VoterAddress;
