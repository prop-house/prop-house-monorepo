import classes from './ProposedSummary.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import Avatar from '../Avatar';

const ProposedSummary: React.FC<{
  highlightAddresses: string[];
  totalNumProps: number;
}> = props => {
  const { highlightAddresses, totalNumProps } = props;
  return (
    <div className={classes.container}>
      <div className={classes.avatars}>
        {highlightAddresses.map((address, index) => {
          return <Avatar key={index} address={address} diameter={14} />;
        })}
      </div>
      <span>{trimEthAddress(highlightAddresses[0])}</span>&nbsp;and&nbsp;
      <span>{totalNumProps}&nbsp;others</span>&nbsp;proposed
    </div>
  );
};
export default ProposedSummary;
