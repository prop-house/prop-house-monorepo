import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link } from 'react-router-dom';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import detailedTime from '../../utils/detailedTime';
import EthAddress from '../EthAddress';
import { Col, Row } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus } from '../../utils/auctionStatus';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  votesFor?: number;
  votesLeft?: number;
  handleUserVote?: (direction: Direction, proposalId: number) => void;
}> = (props) => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    votesFor,
    votesLeft,
    handleUserVote,
  } = props;

  const ctaButton = (
    <Row>
      <Col xs={12} className={classes.bottomContainer}>
        <div className={classes.votesCopyContainer}>
          {cardStatus === ProposalCardStatus.Voting && (
            <div className={classes.yourVotesCopy}>Your votes: {votesFor}</div>
          )}
          <div className={classes.scoreCopy}>
            Score: {Math.trunc(proposal.score)}
          </div>
        </div>
        <div className={classes.votesButtonContainer}>
          <Button
            text="↑"
            bgColor={ButtonColor.Yellow}
            classNames={classes.voteBtn}
            onClick={() =>
              handleUserVote && handleUserVote(Direction.Up, proposal.id)
            }
            disabled={votesLeft === 0}
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
        cardStatus === ProposalCardStatus.Voting
          ? globalClasses.yellowBorder
          : cardStatus === ProposalCardStatus.Winner
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
        {auctionStatus === AuctionStatus.AuctionVoting &&
        cardStatus !== ProposalCardStatus.Voting ? (
          <div className={classes.scoreCopy}>
            Score: {Math.trunc(proposal.score)}
          </div>
        ) : (
          <div
            className={classes.timestamp}
            title={detailedTime(proposal.createdDate)}
          >
            {diffTime(proposal.createdDate)}
          </div>
        )}

        <div className={clsx(classes.readMore)}>
          <Link
            to={`/proposal/${proposal.id}`}
            className={
              cardStatus === ProposalCardStatus.Voting
                ? globalClasses.fontYellow
                : globalClasses.fontPink
            }
          >
            Read more →
          </Link>
        </div>
      </div>
      {cardStatus === ProposalCardStatus.Voting && ctaButton}
    </Card>
  );
};

export default ProposalCard;
