import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link } from 'react-router-dom';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import detailedTime from '../../utils/detailedTime';
import EthAddress from '../EthAddress';
import { Col } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

const ProposalCard: React.FC<{
  proposal: StoredProposal;
  status: ProposalCardStatus;
  votes?: number;
}> = (props) => {
  const { proposal, status, votes } = props;

  const ctaButton = (
    <Col xs={12}>
      <Button
        text={
          status === ProposalCardStatus.Voting
            ? `Cast Vote (${votes ? votes : 0})`
            : ''
        }
        bgColor={ButtonColor.Yellow}
        classNames={classes.voteBtn}
      />
    </Col>
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
