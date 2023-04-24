import classes from './PropStats.module.css';
import getNumberWithOrdinal from '../../utils/getNumberWithOrdinal';
import { useTranslation } from 'react-i18next';
import { Proposal, RoundState } from '@prophouse/sdk-react';

const PropStats: React.FC<{
  state: RoundState;
  userProps: Proposal[];
  cardIndex: number;
  proposals: Proposal[];
  numOfWinners: number;
}> = props => {
  const { userProps, proposals, state, numOfWinners, cardIndex } = props;
  const { t } = useTranslation();

  const allPropsHaveZeroVotes = proposals && proposals.filter(p => BigInt(p.votingPower) > 0).length === 0;
  const fewerPropsThanNumberofWinners = proposals && proposals.length < numOfWinners;

  const currentlyWinningProps =
    proposals &&
    proposals
      .slice()
      .sort((a, b) => (BigInt(a.votingPower) < BigInt(b.votingPower) ? 1 : -1))
      .slice(0, numOfWinners);

  const votesNeededToWin = (prop: Proposal) => {
    if (fewerPropsThanNumberofWinners || (proposals && currentlyWinningProps!.includes(prop)))
      return 0;
    if (allPropsHaveZeroVotes) return '-';

    return (
      currentlyWinningProps &&
      Number(BigInt(currentlyWinningProps[currentlyWinningProps.length - 1].votingPower) - BigInt(prop.votingPower)) + 1
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
            <div className={classes.userPropTextValue}>{userProps[cardIndex].votingPower}</div>
          </div>
        </div>

        {state >= RoundState.IN_VOTING_PERIOD && (
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
                        .sort((a, b) => (BigInt(a.votingPower) < BigInt(b.votingPower) ? 1 : -1))
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
                <div>{state === RoundState.IN_VOTING_PERIOD ? t('votesNeeded') : t('votesFromFunding')}</div>
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
