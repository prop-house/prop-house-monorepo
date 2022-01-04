import classes from './ProposalSignature.module.css';
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
import { recoverAddress } from '@ethersproject/transactions';
import { verifyMessage } from '@ethersproject/wallet';
import clsx from 'clsx';

export enum AuctionStatus {
  NotStarted,
  AcceptingProposals,
  Voting,
  Ended,
}

const ProposalSignature: React.FC<{
  proposal: StoredProposal,
  className?: string;
}> = (props) => {
  const { proposal, className } = props;
  const recoveredAddress = verifyMessage(Buffer.from(proposal.signedData.message), proposal.signedData.signature)
  console.log(recoveredAddress, proposal.address)
  const valid = recoveredAddress === proposal.address

  return (
        valid ? 
        (<div className={clsx(classes.pass, classes.icon, className)} title={`Proposal was signed by ${proposal.address}!`}>✔️</div>)
        :
        (<div className={clsx(classes.fail, classes.icon, className)} title={`Proposal has invalid signature!`}>✖️</div>)
  );
};

export default ProposalSignature;
