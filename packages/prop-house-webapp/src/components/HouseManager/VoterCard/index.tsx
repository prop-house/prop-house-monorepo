import classes from './VoterCard.module.css';
import Text from '../Text';
import AddressAvatar from '../../AddressAvatar';
import { useEnsName } from 'wagmi';
import trimEthAddress from '../../../utils/trimEthAddress';
import { VotingStrategyType } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { getTokenInfo } from '../utils/getTokenInfo';
import { useEthersProvider } from '../../../hooks/useEthersProvider';

const VoterCard: React.FC<{ type: string; address: string; multiplier?: number }> = props => {
  const { type, address, multiplier } = props;

  const provider = useEthersProvider();
  const { data: ens, isLoading } = useEnsName({ address: address as `0x${string}` });

  const [tokenInfo, setTokenInfo] = useState({ name: '', image: '' });

  useEffect(() => {
    const fetchTokenInfo = async () => {
      const { name, image } = await getTokenInfo(address, provider);
      setTokenInfo({ name, image });
    };
    if (type !== VotingStrategyType.WHITELIST) fetchTokenInfo();
  }, [address, provider, type]);

  return (
    <div className={classes.container}>
      {type !== VotingStrategyType.WHITELIST ? (
        <div className={classes.imageContainer}>
          <img className={classes.image} src={tokenInfo.image} alt="avatar" />
        </div>
      ) : (
        <AddressAvatar address={address} size={42} />
      )}

      <div className={classes.text}>
        <Text type="subtitle">
          {!isLoading && type !== VotingStrategyType.WHITELIST
            ? tokenInfo.name
            : ens
            ? ens
            : trimEthAddress(address)}
        </Text>

        <Text type="body">
          {`${multiplier} vote${multiplier === 1 ? '' : 's'}${
            type !== VotingStrategyType.WHITELIST ? ' / token' : ''
          }`}
        </Text>
      </div>
    </div>
  );
};

export default VoterCard;
