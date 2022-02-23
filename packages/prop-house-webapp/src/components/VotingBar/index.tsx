import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { Direction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import Button from '@restart/ui/esm/Button';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import accountVoteDirection from '../../utils/accountVoteDirection';
import refreshActiveProposal from '../../utils/refreshActiveProposal';
import classes from './VotingBar.module.css';

export interface VotingBarProps {
  votingWrapper: PropHouseWrapper;
}
const VotingBar: React.FC<VotingBarProps> = (props) => {
  const { account } = useEthers();
  const { votingWrapper } = props;
  const activeProposal = useAppSelector(
    (state) => state.propHouse.activeProposal
  );
  const [userVoteDirection, setUserVoteDirection] = useState<
    undefined | Direction
  >(undefined);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!activeProposal) return;
    if (!account) return;
    setUserVoteDirection(accountVoteDirection(account, activeProposal));
  }, [account, activeProposal]);
  if (!activeProposal) return <></>;
  // TODO: empty vote state
  if (!account) return <>Connect Wallet To Vote</>;

  const handleUserVote = async (direction: Direction) => {
    // If user is clicking the same direction, they're intending to remove their vote
    const newDirection =
      direction === userVoteDirection ? Direction.Abstain : direction;

    await votingWrapper.logVote(new Vote(newDirection, activeProposal.id));
    setUserVoteDirection(direction);
    refreshActiveProposal(votingWrapper, activeProposal, dispatch);
  };

  return (
    <div className={classes.votingBar}>
      <Button onClick={() => handleUserVote(Direction.Up)}>
        {userVoteDirection === Direction.Up ? 'Remove Vote For' : 'Vote For'}
      </Button>
      <div>Score: {activeProposal.score}</div>
      <Button onClick={() => handleUserVote(Direction.Down)}>
        {userVoteDirection === Direction.Down
          ? 'Remove Vote Against'
          : 'Vote Against'}
      </Button>
    </div>
  );
};

export default VotingBar;
