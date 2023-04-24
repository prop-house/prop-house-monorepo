import classes from './UserPropCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import isWinner from '../../utils/isWinner';
import { useState } from 'react';
import PropStats from '../PropStats';
import CardFooter from '../UserCardFooter';
import UserCardHeader from '../UserCardHeader';
import { RoundState, Proposal } from '@prophouse/sdk-react';

const UserPropCard: React.FC<{
  userProps: Proposal[];
  state: RoundState;
  proposals: Proposal[] | undefined;
  numOfWinners: number;
  winningIds: number[];
}> = props => {
  const { userProps, winningIds, proposals, state, numOfWinners } = props;
  const [cardIndex, setCardIndex] = useState(0);

  let amountOfPropsWon = 0;
  winningIds &&
    userProps.map((prop: Proposal) => {
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
        state={state}
        amountOfPropsWon={amountOfPropsWon}
        userProps={userProps}
        cardIndex={cardIndex}
        setCardIndex={setCardIndex}
        winningIds={winningIds}
      />

      {state !== RoundState.IN_PROPOSING_PERIOD && proposals && (
        <PropStats
          state={state}
          userProps={userProps}
          cardIndex={cardIndex}
          proposals={proposals}
          numOfWinners={numOfWinners}
        />
      )}

      <CardFooter
        state={state}
        amountOfPropsWon={amountOfPropsWon}
        winningIds={winningIds}
        userProps={userProps}
        cardIndex={cardIndex}
      />
    </Card>
  );
};
export default UserPropCard;
