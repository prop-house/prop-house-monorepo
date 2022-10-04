import classes from './UserCardFooter.module.css';
import isWinner from '../../utils/isWinner';
import { useNavigate } from 'react-router-dom';
import { AuctionStatus } from '../../utils/auctionStatus';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

const UserCardFooter: React.FC<{
  status: AuctionStatus;
  amountOfPropsWon: number;
  userProps: StoredProposalWithVotes[];
  winningIds?: number[];
  cardIndex: number;
}> = props => {
  const { status, amountOfPropsWon, userProps, winningIds, cardIndex } = props;

  let navigate = useNavigate();

  return (
    <>
      {status === AuctionStatus.AuctionEnded &&
      amountOfPropsWon > 0 &&
      winningIds &&
      isWinner(winningIds, userProps[cardIndex].id) ? (
        <>
          <p className={classes.sideCardBody}>
            <b>What's next:</b>

            <div className={classes.bulletList}>
              <div className={classes.bulletItem}>
                <hr className={classes.bullet} />
                <p>
                  Funds will be sent from the corresponding community treasury to the addresses that
                  submitted the proposal.
                </p>
              </div>
            </div>
          </p>
        </>
      ) : (
        <div
          onClick={e => {
            if (cmdPlusClicked(e)) {
              openInNewTab(`${window.location.href}/${userProps[cardIndex].id}`);
              return;
            }
            navigate(`${userProps[cardIndex].id}`);
          }}
          className={classes.viewProposal}
        >
          View
        </div>
      )}
    </>
  );
};
export default UserCardFooter;
