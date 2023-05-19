import { Row, Col } from 'react-bootstrap';
import classes from './InfRoundVotingControls.module.css';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { allotVotes } from '../../state/slices/voting';
import { Direction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import React, { useCallback, useEffect } from 'react';
import {
  countVotesAllottedToProp,
  countVotesAllottedToPropWithDirection,
} from '../../utils/countVotesAllottedToProp';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import TruncateThousands from '../TruncateThousands';
import { countNumVotesForProp } from '../../utils/countNumVotesForProp';
import { countNumVotesForPropWithDirection } from '../../utils/countNumVotesForPropWithDirection';

const InfRoundVotingControls: React.FC<{
  proposal: StoredProposalWithVotes;
  showVoteAllotmentModal?: boolean;
}> = props => {
  const { proposal, showVoteAllotmentModal } = props;

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);
  const modalActive = useAppSelector(state => state.propHouse.modalActive);
  const dispatch = useAppDispatch();

  const submittedUpVotesForProp = countNumVotesForPropWithDirection(
    votesByUserInActiveRound,
    proposal.id,
    Direction.Up,
  );
  const submittedDownVotesForProp = countNumVotesForPropWithDirection(
    votesByUserInActiveRound,
    proposal.id,
    Direction.Down,
  );
  const allottedVotesForProp = proposal && countVotesAllottedToProp(voteAllotments, proposal.id);
  const allotedUpVotesForProp =
    proposal && countVotesAllottedToPropWithDirection(voteAllotments, proposal.id, Direction.Up);
  const allotedDownVotesForProp =
    proposal && countVotesAllottedToPropWithDirection(voteAllotments, proposal.id, Direction.Down);

  const perPropVotesRemaining =
    votingPower - countNumVotesForProp(votesByUserInActiveRound, proposal.id);

  const upVotesDisabled = allotedUpVotesForProp > 0;
  const downVotesDisabled = allotedDownVotesForProp > 0;
  const voteMultiplier = allotedDownVotesForProp === 0 && allotedUpVotesForProp === 0 ? 1 : 2; // enables one way voting w all voting power

  useEffect(() => {
    if (allottedVotesForProp === undefined) return;
  }, [allottedVotesForProp]);

  // handles votes by clicking up/down arrows
  const handleClickVote = (e: any, direction: Direction) => {
    if (!proposal || perPropVotesRemaining === 0) return;

    e.stopPropagation();

    dispatch(
      allotVotes({
        voteAllotment: {
          proposalId: proposal.id,
          proposalTitle: proposal.title,
          direction: direction,
          votes: perPropVotesRemaining * voteMultiplier,
        },
      }),
    );
  };

  // handle votes by up/down keyboard press
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!modalActive || showVoteAllotmentModal) return; // only use keyboard voting in modal

      const direction =
        event.key === 'ArrowUp'
          ? Direction.Up
          : event.key === 'ArrowDown'
          ? Direction.Down
          : undefined;

      if (direction === undefined || !proposal || perPropVotesRemaining === 0) return;
      if (direction === Direction.Up && upVotesDisabled) return;
      if (direction === Direction.Down && downVotesDisabled) return;

      event.preventDefault();

      dispatch(
        allotVotes({
          voteAllotment: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            direction: direction,
            votes: perPropVotesRemaining * voteMultiplier,
          },
        }),
      );
    },
    [
      modalActive,
      showVoteAllotmentModal,
      proposal,
      dispatch,
      downVotesDisabled,
      perPropVotesRemaining,
      upVotesDisabled,
      voteMultiplier,
    ],
  );

  useEffect(() => {
    if (!modalActive) return;

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, modalActive]);

  return (
    <Row>
      <Col xs={12} className={classes.bottomContainer} onClick={(e: any) => e.stopPropagation()}>
        <div className={classes.votingBtnsContainer}>
          <button
            onClick={e => handleClickVote(e, Direction.Up)}
            disabled={upVotesDisabled}
            className={clsx(classes.votingBtn, classes.up)}
          >
            <FiThumbsUp />
            <TruncateThousands amount={submittedUpVotesForProp + allotedUpVotesForProp} />
          </button>

          <button
            onClick={e => handleClickVote(e, Direction.Down)}
            disabled={downVotesDisabled}
            className={clsx(classes.votingBtn, classes.down)}
          >
            <FiThumbsDown />
            <TruncateThousands amount={submittedDownVotesForProp + allotedDownVotesForProp} />
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default InfRoundVotingControls;
