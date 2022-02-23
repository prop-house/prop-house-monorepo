import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link } from 'react-router-dom';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import detailedTime from '../../utils/detailedTime';
import EthAddress from '../EthAddress';
import { Col, Row } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';
import { Direction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

const ProposalCard: React.FC<{
  proposal: StoredProposal;
  status: ProposalCardStatus;
  votesFor?: number;
  votesLeft?: number;
  handleUserVote?: (direction: Direction, proposalId: number) => void;
}> = (props) => {
  const { proposal, status, votesFor, votesLeft, handleUserVote } = props;

  const ctaButton = (
    <Row>
      <Col xs={12} className={classes.bottomContainer}>
        <div
          className={clsx(
            classes.votesCopy,
            votesFor === 0 ? classes.noVotesLeft : ''
          )}
        >
          {votesFor && votesFor > 0
            ? `Votes: ${votesFor}`
            : votesLeft === 0
            ? 'No votes left'
            : 'Cast vote'}
        </div>
        <div className={classes.votesButtonContainer}>
          <Button
            text="↑"
            bgColor={ButtonColor.Yellow}
            classNames={classes.voteBtn}
            onClick={() =>
              handleUserVote && handleUserVote(Direction.Up, proposal.id)
            }
          />
          <Button
            text="↓"
            bgColor={ButtonColor.Yellow}
            classNames={classes.voteBtn}
            onClick={() =>
              handleUserVote && handleUserVote(Direction.Down, proposal.id)
            }
            disabled={votesFor === 0 ? true : false}
          />
        </div>
      </Col>
    </Row>
  );

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={clsx(
        status === ProposalCardStatus.Voting
          ? globalClasses.yellowBorder
          : status === ProposalCardStatus.Winner
          ? globalClasses.pinkBorder
          : '',
        classes.proposalCard
      )}
    >
      <div className={classes.authorContainer}>
        <EthAddress>{proposal.address}</EthAddress>
        <span>proposed</span>
      </div>
      <div className={classes.title}>{proposal.title}</div>
      <div className={classes.timestampAndlinkContainer}>
        <div
          className={classes.timestamp}
          title={detailedTime(proposal.createdDate)}
        >
          {diffTime(proposal.createdDate)}
        </div>
        <div className={clsx(classes.readMore)}>
          <Link
            to={`/proposal/${proposal.id}`}
            className={
              status === ProposalCardStatus.Voting
                ? globalClasses.fontYellow
                : globalClasses.fontPink
            }
          >
            Read more →
          </Link>
        </div>
      </div>
      {status === ProposalCardStatus.Voting && ctaButton}
    </Card>
  );
};

export default ProposalCard;
