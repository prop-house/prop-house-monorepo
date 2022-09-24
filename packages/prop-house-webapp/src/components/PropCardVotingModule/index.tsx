import { Row, Col } from 'react-bootstrap';
import classes from './PropCardVotingModule.module.css';
import { ProposalCardStatus } from '../../utils/cardStatus';
import { votesForProp } from '../../utils/voteAllotment';
import { Direction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { canAllotVotes } from '../../utils/canAllotVotes';
import { allotVotes } from '../../state/slices/voting';

const PropCardVotingModule: React.FC<{
  proposal: StoredProposal;
  cardStatus: ProposalCardStatus;
}> = props => {
  const { proposal } = props;

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);
  const dispatch = useAppDispatch();

  const allottedVotesForProp = votesForProp(voteAllotments, proposal.id);
  const _canAllotVotes = canAllotVotes(votingPower, submittedVotes, voteAllotments);

  const handleClick = (e: any, direction: Direction) => {
    e.stopPropagation();
    dispatch(
      allotVotes({
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        direction: direction,
        weight: 1,
      }),
    );
  };

  return (
    <Row>
      <Col xs={12} className={classes.bottomContainer} onClick={(e: any) => e.stopPropagation()}>
        <div
          className={clsx(
            classes.votesModuleContainer,
            allottedVotesForProp > 0 && classes.activelyAllotting,
          )}
        >
          <div className={classes.votesAllottedDisplay}> {allottedVotesForProp} </div>
        </div>

        <div className={classes.voteBtns}>
          <Button
            text="↓"
            bgColor={allottedVotesForProp > 0 ? ButtonColor.PurpleLight : ButtonColor.Gray}
            classNames={classes.voteBtn}
            onClick={e => handleClick(e, Direction.Down)}
            disabled={allottedVotesForProp === 0}
          />
          <Button
            text="↑"
            bgColor={allottedVotesForProp > 0 ? ButtonColor.PurpleLight : ButtonColor.Gray}
            classNames={classes.voteBtn}
            onClick={e => handleClick(e, Direction.Up)}
            disabled={!_canAllotVotes}
          />
        </div>
      </Col>
    </Row>
  );
};

export default PropCardVotingModule;
