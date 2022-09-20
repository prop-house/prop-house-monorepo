import { Row, Col } from 'react-bootstrap';
import classes from './PropCardVotingModule.module.css';
import { ProposalCardStatus } from '../../utils/cardStatus';
import { VoteAllotment, votesForProp } from '../../utils/voteAllotment';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';

const PropCardVotingModule: React.FC<{
  proposal: StoredProposal;
  cardStatus: ProposalCardStatus;
  voteAllotments: VoteAllotment[];
  canAllotVotes: boolean;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
}> = props => {
  const { proposal, voteAllotments, canAllotVotes, handleVoteAllotment } = props;

  const allottedVotesForProp = votesForProp(voteAllotments, proposal.id);

  const handleClick = (e: any, direction: boolean) => {
    e.stopPropagation();

    handleVoteAllotment(proposal.id, direction);
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
            onClick={e => handleClick(e, false)}
            disabled={allottedVotesForProp === 0}
          />
          <Button
            text="↑"
            bgColor={allottedVotesForProp > 0 ? ButtonColor.PurpleLight : ButtonColor.Gray}
            classNames={classes.voteBtn}
            onClick={e => handleClick(e, true)}
            disabled={!canAllotVotes}
          />
        </div>
      </Col>
    </Row>
  );
};

export default PropCardVotingModule;
