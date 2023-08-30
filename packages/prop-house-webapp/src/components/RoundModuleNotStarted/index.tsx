import classes from '../AcceptingPropsModule/AcceptingPropsModule.module.css';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import RoundModuleCard from '../RoundModuleCard';
import { useAccount } from 'wagmi';
import useProposalGrants from '../../hooks/useProposalGrants';
import { BsPersonFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';

const RoundModuleNotStarted: React.FC<{
  auction: StoredAuctionBase;
}> = props => {
  const { auction } = props;

  const { address: account } = useAccount();

  // eslint-disable-next-line
  const [loadingCanPropose, canPropose, proposingCopy, votingCopy] = useProposalGrants(
    auction,
    account,
  );

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>{proposingCopy}</p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>{votingCopy}</p>
        </div>
      </div>
    </>
  );

  return (
    <RoundModuleCard
      title={'Round participation'}
      subtitle={<>Who can play</>}
      content={content}
      type="not started"
    />
  );
};

export default RoundModuleNotStarted;
