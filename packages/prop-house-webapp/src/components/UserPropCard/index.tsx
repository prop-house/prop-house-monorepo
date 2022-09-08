import classes from './UserPropCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isWinner from '../../utils/isWinner';
import { useState } from 'react';
import { AuctionStatus } from '../../utils/auctionStatus';
import { findProposalById } from '../../utils/findProposalById';
import getNumberWithOrdinal from '../../utils/getNumberWithOrdinal';

const UserPropCard: React.FC<{
  userProps: any;
  winningIds?: number[] | undefined;
  totalVotes?: number;
  status: AuctionStatus;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
}> = props => {
  const { userProps, winningIds, totalVotes, proposals, status, numOfWinners } = props;
  const [cardIndex, setCardIndex] = useState(0);

  let navigate = useNavigate();

  const lowestScoreWinner =
    winningIds && proposals && findProposalById(winningIds[winningIds.length - 1], proposals);
  const getMinimumVotesNeededToWin = (votes: number) =>
    lowestScoreWinner && lowestScoreWinner.score - votes + 1;
  const allPropsHaveZeroVotes = proposals && proposals.filter(p => p.score > 0).length === 0;
  const fewerPropsThanNumberofWinners = proposals && proposals.length < numOfWinners;

  let amountOfPropsWon = 0;
  winningIds &&
    userProps.map((prop: StoredProposalWithVotes) => {
      if (isWinner(winningIds, prop.id)) amountOfPropsWon++;

      return amountOfPropsWon;
    });

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.thirty}
      classNames={clsx(classes.sidebarContainerCard, classes.userPropCard)}
    >
      <div className={classes.sideCardHeader}>
        <div className={classes.textContainer}>
          <p className={classes.subtitle}>
            {status === AuctionStatus.AuctionEnded
              ? amountOfPropsWon > 0 && winningIds && isWinner(winningIds, userProps[cardIndex].id)
                ? `Your ${amountOfPropsWon > 1 ? 'proposal' : 'proposals'} won!`
                : `Your ${userProps.length === 1 ? 'proposal' : 'proposals'}`
              : `Your ${userProps.length === 1 ? 'proposal' : 'proposals'}`}
          </p>

          <div className={classes.titleAndVoteBtns}>
            <p className={classes.title}>{userProps[cardIndex].title}</p>
            {userProps.length > 1 && (
              <div className={classes.votesModuleContainer}>
                <Button
                  text="←"
                  bgColor={ButtonColor.Gray}
                  onClick={() => setCardIndex(cardIndex - 1)}
                  classNames={classes.voteBtn}
                  disabled={cardIndex === 0}
                />

                <Button
                  text="→"
                  bgColor={ButtonColor.Gray}
                  onClick={() => setCardIndex(cardIndex + 1)}
                  classNames={classes.voteBtn}
                  disabled={cardIndex === userProps.length - 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className={classes.divider} />

      {status !== AuctionStatus.AuctionAcceptingProps && (
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

            {(status === AuctionStatus.AuctionVoting ||
              (status === AuctionStatus.AuctionEnded &&
                winningIds &&
                isWinner(winningIds, userProps[cardIndex].id))) && (
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
            )}

            {(status === AuctionStatus.AuctionVoting ||
              (status === AuctionStatus.AuctionEnded &&
                winningIds &&
                !isWinner(winningIds, userProps[cardIndex].id))) && (
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
      )}

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
              <div className={classes.bulletItem}>
                <hr className={classes.bullet} />
                <p>We strive to send funds within 48 hours of the round closing..</p>
              </div>
            </div>
          </p>
        </>
      ) : (
        <div
          onClick={e => {
            if (e.metaKey || e.ctrlKey) {
              window.open(`${window.location.href}/${userProps[cardIndex].id}`, `_blank`); // open in new tab
            } else {
              navigate(`${userProps[cardIndex].id}`);
            }
          }}
          className={classes.viewProposal}
        >
          View
        </div>
      )}
    </Card>
  );
};
export default UserPropCard;
