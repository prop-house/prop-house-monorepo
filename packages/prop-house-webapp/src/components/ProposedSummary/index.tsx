import classes from './ProposedSummary.module.css';
import trimEthAddress from '../../utils/trimEthAddress';
import Avatar from '../Avatar';

const ProposedSummary: React.FC<{
  proposers: string[];
}> = props => {
  const { proposers } = props;
  const totalNumProps = proposers.length;
  const randomProposer = proposers[Math.floor(Math.random() * proposers.length)];

  return totalNumProps === 0 ? (
    <></>
  ) : (
    <div className={classes.container}>
      <div className={classes.avatars}>
        {proposers.slice(0, 3).map((address, index) => {
          return <Avatar key={index} address={address} diameter={14} />;
        })}
      </div>
      {totalNumProps === 1 && (
        <>
          <span>{trimEthAddress(proposers[0])}</span>&nbsp;submitted a prop!
        </>
      )}
      {totalNumProps > 1 && (
        <>
          <span>{trimEthAddress(randomProposer)}</span>&nbsp;and&nbsp;
          <span>
            {totalNumProps - 1}&nbsp;other{totalNumProps - 1 > 1 && 's'}
          </span>
          &nbsp;proposed
        </>
      )}
    </div>
  );
};
export default ProposedSummary;
