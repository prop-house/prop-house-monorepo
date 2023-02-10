import classes from './StrategyCard.module.css';
import Text from '../Text';
import AddressAvatar from '../../AddressAvatar';

const StrategyCard: React.FC<{ name: string }> = props => {
  const { name } = props;

  return (
    <div className={classes.container}>
      <AddressAvatar address={'cdt.eth'} size={42} />

      <div className={classes.text}>
        <Text type="subtitle">{name}</Text>

        <Text type="body">1 vote/token</Text>
      </div>
    </div>
  );
};

export default StrategyCard;
