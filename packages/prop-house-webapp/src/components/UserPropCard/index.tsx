import classes from './UserPropCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isWinner from '../../utils/isWinner';
import { useState } from 'react';
import { AuctionStatus } from '../../utils/auctionStatus';
import PropStats from '../PropStats';

const UserPropCard: React.FC<{
  userProps: any;
  status: AuctionStatus;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
  winningIds: number[] | undefined;
  totalVotes: number | undefined;
}> = props => {
  const { userProps, winningIds, totalVotes, proposals, status, numOfWinners } = props;
  const [cardIndex, setCardIndex] = useState(0);

  let navigate = useNavigate();

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
        <PropStats
          status={status}
          userProps={userProps}
          totalVotes={totalVotes}
          winningIds={winningIds}
          cardIndex={cardIndex}
          proposals={proposals}
          numOfWinners={numOfWinners}
        />
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
