import classes from './PropStats.module.css';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isWinner from '../../utils/isWinner';
import { AuctionStatus } from '../../utils/auctionStatus';
import { findProposalById } from '../../utils/findProposalById';
import getNumberWithOrdinal from '../../utils/getNumberWithOrdinal';

const PropStats: React.FC<{
  status: AuctionStatus;
  userProps: any;
  totalVotes: number | undefined;
  winningIds: number[] | undefined;
  cardIndex: number;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
}> = props => {
  const { userProps, winningIds, totalVotes, proposals, status, numOfWinners, cardIndex } = props;

  const lowestScoreWinner =
    winningIds && proposals && findProposalById(winningIds[winningIds.length - 1], proposals);
  const getMinimumVotesNeededToWin = (votes: number) =>
    lowestScoreWinner && lowestScoreWinner.score - votes + 1;
  const allPropsHaveZeroVotes = proposals && proposals.filter(p => p.score > 0).length === 0;
  const fewerPropsThanNumberofWinners = proposals && proposals.length < numOfWinners;

  return (
    <>
      <div className={classes.userPropInfo}>
        <div className={classes.userPropItem}>
          <div className={classes.userPropNounImg}>
            <img src="/heads/calculator.png" alt="calculator" />
          </div>
          <div className={classes.userPropText}>
            <div>Total Votes</div>
            <div className={classes.userPropTextValue}>{totalVotes}</div>
          </div>
        </div>

        {status === AuctionStatus.AuctionVoting ||
        (status === AuctionStatus.AuctionEnded &&
          winningIds &&
          isWinner(winningIds, userProps[cardIndex].id)) ? (
          <div className={classes.userPropItem}>
            <div className={classes.userPropNounImg}>
              <img src="/heads/crown.png" alt="crown" />
            </div>

            <div className={classes.userPropText}>
              <div>Position</div>
              <div className={classes.userPropTextValue}>
                {proposals &&
                  getNumberWithOrdinal(
                    proposals.findIndex(p => p.id === userProps[cardIndex].id) + 1,
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className={classes.userPropItem}>
            <div className={classes.userPropNounImg}>
              <img src="/heads/wallet.png" alt="wallet" />
            </div>
            <div className={classes.userPropText}>
              <div>Votes Needed</div>
              <div className={classes.userPropTextValue}>
                {fewerPropsThanNumberofWinners
                  ? 0
                  : allPropsHaveZeroVotes
                  ? '-'
                  : getMinimumVotesNeededToWin(Number(userProps[cardIndex].score))}
              </div>
            </div>
          </div>
        )}
      </div>
      <hr className={classes.divider} />
    </>
  );
};
export default PropStats;
