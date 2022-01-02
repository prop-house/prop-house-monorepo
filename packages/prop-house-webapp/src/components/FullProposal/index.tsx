import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StatusPillState } from '../StatusPill';
import { StoredAuction, StoredProposal, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import RenderedProposal from '../RenderedProposal';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useState } from 'react';
import VotingBar from '../VotingBar';

export enum AuctionStatus {
  NotStarted,
  AcceptingProposals,
  Voting,
  Ended,
}

const FullProposal: React.FC<{
  proposal: StoredProposal;
  votingWrapper: PropHouseWrapper
}> = (props) => {
  const { proposal, votingWrapper } = props;

  return (
    <Card
      bgColor={CardBgColor.LightPurple}
      borderRadius={CardBorderRadius.thirty}
    >
      <VotingBar votingWrapper={votingWrapper} />
      <RenderedProposal proposal={proposal} />
    </Card>
  );
};

export default FullProposal;
