import classes from './AwardAddress.module.css';
import clsx from 'clsx';
import Group from '../Group';
import Text from '../Text';
import trimEthAddress from '../../../utils/trimEthAddress';
import { Award } from '../AssetSelector';

const AwardAddress: React.FC<{
  isTyping: boolean;
  award: Award;
  placeholder?: string;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
}> = props => {
  const { award, isTyping, handleBlur, handleChange, handleSwitch, placeholder } = props;

  const verifiedAddress = award.state === 'success';

  return (
    <>
      <div className={classes.container}>
        <Group gap={6} classNames={classes.addressAndTitle}>
          <Text type="subtitle">Contract Address</Text>

          <Group>
            {verifiedAddress ? (
              // after onBlur verification, show the address' token info
              // it's a button so that the user can click it to switch back to the input
              <button className={classes.addressSuccess} onClick={handleSwitch}>
                {
                  <div className={classes.addressImgAndTitle}>
                    <img
                      src={award.image ? award.image : '/manager/fallback.png'}
                      alt={award.name}
                    />

                    <span>{award.name}</span>
                  </div>
                }

                <div>{trimEthAddress(award.address)}</div>
              </button>
            ) : (
              <div className={classes.addressContainer}>
                <input
                  className={clsx(
                    classes.addressInput,
                    award.state === 'error' && classes.addressInputError,
                  )}
                  type="text"
                  value={award.address}
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

        {award.state === 'error' && !isTyping && (
          <Group mt={-10}>
            <p className={classes.error}>{award.error}</p>
          </Group>
        )}
      </div>
    </>
  );
};

export default AwardAddress;
