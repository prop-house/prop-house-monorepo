import classes from './PropStats.module.css';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus } from '../../utils/auctionStatus';
import getNumberWithOrdinal from '../../utils/getNumberWithOrdinal';
import { useTranslation } from 'react-i18next';

const PropStats: React.FC<{
  status: AuctionStatus;
  userProps: StoredProposalWithVotes[];
  cardIndex: number;
  proposals: StoredProposalWithVotes[];
  numOfWinners: number;
}> = props => {
  const { userProps, proposals, status, numOfWinners, cardIndex } = props;
  const { t } = useTranslation();

  const isVotingWindow = status === AuctionStatus.AuctionVoting;
  const isRoundOver = status === AuctionStatus.AuctionEnded;

  const allPropsHaveZeroVotes = proposals && proposals.filter(p => p.voteCount > 0).length === 0;
  const fewerPropsThanNumberofWinners = proposals && proposals.length < numOfWinners;

  const currentlyWinningProps =
    proposals &&
    proposals
      .slice()
      .sort((a, b) => (a.voteCount < b.voteCount ? 1 : -1))
      .slice(0, numOfWinners);

  const votesNeededToWin = (prop: any) => {
    if (fewerPropsThanNumberofWinners || (proposals && currentlyWinningProps!.includes(prop)))
      return 0;
    if (allPropsHaveZeroVotes) return '-';

    return (
      currentlyWinningProps &&
      currentlyWinningProps[currentlyWinningProps.length - 1].voteCount - prop.voteCount + 1
    );
  };

  return (
    <>
      <div className={classes.userPropInfo}>
        <div className={classes.userPropItem}>
          <div className={classes.userPropNounImg}>
            <img src="/heads/calculator.png" alt="calculator" />
          </div>
          <div className={classes.userPropText}>
            <div>{t('totalVotes')}</div>
            <div className={classes.userPropTextValue}>{userProps[cardIndex].voteCount}</div>
          </div>
        </div>

        {(isVotingWindow || isRoundOver) && (
          <>
            <div className={classes.userPropItem}>
              <div className={classes.userPropNounImg}>
                <img src="/heads/crown.png" alt="crown" />
              </div>

              <div className={classes.userPropText}>
                <div>{t('position')}</div>
                <div className={classes.userPropTextValue}>
                  {proposals &&
                    getNumberWithOrdinal(
                      proposals
                        .slice()
                        .sort((a, b) => (a.voteCount < b.voteCount ? 1 : -1))
                        .findIndex(p => p.id === userProps[cardIndex].id) + 1,
                    )}
                </div>
              </div>
            </div>

            <div className={classes.userPropItem}>
              <div className={classes.userPropNounImg}>
                <img src="/heads/wallet.png" alt="wallet" />
              </div>
              <div className={classes.userPropText}>
                <div>{isVotingWindow ? t('votesNeeded') : t('votesFromFunding')}</div>
                <div className={classes.userPropTextValue}>
                  {votesNeededToWin(userProps[cardIndex])}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <hr className={classes.divider} />
    </>
  );
};
export default PropStats;
