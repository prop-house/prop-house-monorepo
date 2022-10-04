import classes from './UserPropCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isWinner from '../../utils/isWinner';
import { useState } from 'react';
import { AuctionStatus } from '../../utils/auctionStatus';
import PropStats from '../PropStats';
import CardFooter from '../UserCardFooter';
import UserCardHeader from '../UserCardHeader';

const UserPropCard: React.FC<{
  userProps: StoredProposalWithVotes[];
  status: AuctionStatus;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
  winningIds: number[] | undefined;
}> = props => {
  const { userProps, winningIds, proposals, status, numOfWinners } = props;
  const [cardIndex, setCardIndex] = useState(0);

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
      <UserCardHeader
        status={status}
        amountOfPropsWon={amountOfPropsWon}
        userProps={userProps}
        cardIndex={cardIndex}
        setCardIndex={setCardIndex}
        winningIds={winningIds && winningIds}
      />

      {status !== AuctionStatus.AuctionAcceptingProps && proposals && (
        <PropStats
          status={status}
          userProps={userProps}
          cardIndex={cardIndex}
          proposals={proposals}
          numOfWinners={numOfWinners}
        />
      )}

      <CardFooter
        status={status}
        amountOfPropsWon={amountOfPropsWon}
        winningIds={winningIds && winningIds}
        userProps={userProps}
        cardIndex={cardIndex}
      />
    </Card>
  );
};
export default UserPropCard;
