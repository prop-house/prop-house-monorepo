import classes from './VotingStrategy.module.css';
import Group from '../Group';
import EthAddress from '../../EthAddress';
import { VotingStrategyType } from '@prophouse/sdk';
import { getTokenInfo } from '../utils/getTokenInfo';
import { useEffect, useState } from 'react';
import AddressAvatar from '../../AddressAvatar';
import Button, { ButtonColor } from '../../Button';

const VotingStrategy: React.FC<{
  type: string;
  address: string;
  multiplier?: number;
  isDisabled?: boolean;
  removeStrategy: (address: string, type: string) => void;
}> = props => {
  const { type, address, multiplier, isDisabled, removeStrategy } = props;

  const [tokenInfo, setTokenInfo] = useState({ name: '', image: '' });

  useEffect(() => {
    const fetchTokenInfo = async () => {
      const { name, collectionName, image } = await getTokenInfo(address);
      setTokenInfo({ name: name === 'Unidentified contract' ? collectionName : name, image });
    };
    if (type !== VotingStrategyType.WHITELIST) fetchTokenInfo();
  }, [address, type]);

  return (
    <Group row gap={15} classNames={classes.row}>
      <div className={classes.addressSuccess}>
        {type === VotingStrategyType.WHITELIST ? (
          <Group row gap={4} classNames={classes.ens}>
            <AddressAvatar address={address} size={16} />

            <EthAddress address={address} />
          </Group>
        ) : (
          <div className={classes.addressImgAndTitle}>
            <img
              src={
                tokenInfo.image || 'https://nouns.wtf/static/media/loading-skull-noun.d7293d44.gif'
              }
              alt={tokenInfo.name}
            />

            <span>{tokenInfo.name} holders</span>
          </div>
        )}

        <div className={classes.votesText}>
          {`${multiplier} vote${multiplier === 1 ? '' : 's'}${
            type !== VotingStrategyType.WHITELIST ? ' / token' : ''
          }`}
        </div>
      </div>

      <Button
        text="&#x2715;"
        classNames={classes.xButtonMobile}
        bgColor={ButtonColor.White}
        disabled={isDisabled}
        onClick={() => removeStrategy(address, type)}
      />
      <Button
        text="Remove"
        classNames={classes.xButtonDesktop}
        bgColor={ButtonColor.White}
        disabled={isDisabled}
        onClick={() => removeStrategy(address, type)}
      />
    </Group>
  );
};

export default VotingStrategy;
