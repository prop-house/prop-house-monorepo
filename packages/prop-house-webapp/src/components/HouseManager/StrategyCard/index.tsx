import classes from './StrategyCard.module.css';
import Text from '../Text';
import { AddressProps } from '../VotingStrategies';
import AddressAvatar from '../../AddressAvatar';
import { useEnsName } from 'wagmi';
import trimEthAddress from '../../../utils/trimEthAddress';

const StrategyCard: React.FC<{ address: AddressProps }> = props => {
  const { address } = props;
  const { type, addressName: name, votesPerToken: votes, addressImage: image } = address;

  const { data: ens, isLoading } = useEnsName({ address: address.addressValue as `0x${string}` });

  return (
    <div className={classes.container}>
      {type === 'contract' ? (
        <div className={classes.imageContainer}>
          <img className={classes.image} src={image} alt="avatar" />
        </div>
      ) : (
        <AddressAvatar address={address.addressValue} size={42} />
      )}

      <div className={classes.text}>
        <Text type="subtitle">
          {!isLoading && type === 'contract'
            ? name
            : ens
            ? ens
            : trimEthAddress(address.addressValue)}
        </Text>

        <Text type="body">
          {type === 'contract'
            ? `${votes} ${votes === 1 ? 'vote' : 'votes'}/token`
            : `${votes} ${votes === 1 ? 'vote' : 'votes'}`}
        </Text>
      </div>
    </div>
  );
};

export default StrategyCard;
