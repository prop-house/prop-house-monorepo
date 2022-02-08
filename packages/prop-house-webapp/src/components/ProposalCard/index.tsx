import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link } from 'react-router-dom';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import detailedTime from '../../utils/detailedTime';
import EthAddress from '../EthAddress';
import { Row } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';

export enum ProposalCardStatus {
  Default,
  CanVoteFor,
  VotedFor,
  Winner,
}

const ProposalCard: React.FC<{
  proposal: StoredProposal;
  status: ProposalCardStatus;
}> = (props) => {
  const { proposal, status } = props;

  const ctaButton = (
    <Button
      text={
        status === ProposalCardStatus.CanVoteFor
          ? 'Cast your vote'
          : status === ProposalCardStatus.VotedFor
          ? 'You voted for this'
          : ''
      }
      bgColor={ButtonColor.WhiteYellow}
      classNames={classes.voteBtn}
    />
  );

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.twenty}
      classNames={
        status === ProposalCardStatus.VotedFor
          ? globalClasses.yellowBorder
          : status === ProposalCardStatus.Winner
          ? globalClasses.pinkBorder
          : ''
      }
    >
      <Row>
        <div className={classes.author}>
          <EthAddress>{proposal.address}</EthAddress>
          <span>proposed</span>
        </div>
        <div className={classes.title}>{proposal.title}</div>
        <div className={classes.bottomContainer}>
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
                status === ProposalCardStatus.CanVoteFor ||
                status === ProposalCardStatus.VotedFor
                  ? globalClasses.fontYellow
                  : globalClasses.fontPink
              }
            >
              Read more →
            </Link>
          </div>
        </div>
        {(status === ProposalCardStatus.CanVoteFor ||
          status === ProposalCardStatus.VotedFor) &&
          ctaButton}
      </Row>
    </Card>
  );
};

export default ProposalCard;
