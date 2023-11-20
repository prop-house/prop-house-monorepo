import classes from './AwardAddress.module.css';
import clsx from 'clsx';
import Group from '../Group';
import Text from '../Text';
import trimEthAddress from '../../../utils/trimEthAddress';
import { EditableAsset } from '../AssetSelector';
import { AssetWithMetadata, useAssetWithMetadata } from '../../../hooks/useAssetsWithMetadata';

const AwardAddress: React.FC<{
  isTyping: boolean;
  award: EditableAsset;
  placeholder?: string;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
}> = props => {
  const { award, isTyping, handleBlur, handleChange, handleSwitch, placeholder } = props;

  const [loading, assetWithMetadata] = useAssetWithMetadata(award);
  const asset = { ...assetWithMetadata, ...award } as EditableAsset & AssetWithMetadata;

  return (
    <>
      <div className={classes.container}>
        <Group gap={6} classNames={classes.addressAndTitle}>
          <Text type="subtitle">Contract Address</Text>

          <Group>
            {award.state === 'valid' ? (
              // after onBlur verification, show the address' token info
              // it's a button so that the user can click it to switch back to the input
              <button className={classes.addressSuccess} onClick={handleSwitch}>
                {
                  <div className={classes.addressImgAndTitle}>
                    <img
                      src={asset.tokenImg ? asset.tokenImg : '/manager/fallback.png'}
                      alt={asset.symbol}
                    />

                    <span>{asset.symbol}</span>
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
                  placeholder={placeholder ? placeholder : '0x0...000'}
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
