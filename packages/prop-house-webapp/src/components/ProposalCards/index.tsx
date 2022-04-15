import {
  Proposal,
  StoredAuction,
  StoredProposal,
  StoredVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard, { ProposalCardStatus } from '../ProposalCard';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEffect, useRef, useState } from 'react';
import auctionStatus, { AuctionStatus } from '../../utils/auctionStatus';
import { setActiveProposals } from '../../state/slices/propHouse';
import { useEthers } from '@usedapp/core';
import countNumVotesForProposal from '../../utils/countNumVotesForProposal';
import extractAllVotes from '../../utils/extractAllVotes';
import { Direction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import Modal from '../Modal';

interface VotingAlert {
  title: string;
  content: string;
}

const ProposalCards: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const dispatch = useAppDispatch();
  const { account, library: provider } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [userVotes, setUserVotes] = useState<StoredVote[]>();
  const [showModal, setShowModal] = useState(false);
  const [votingAlert, setVotingAlert] = useState<VotingAlert>();

  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  // initial fetch
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));
      setUserVotes(extractAllVotes(proposals, account ? account : ''));
    };
    fetchAuctionProposals();
  }, [auction.id, dispatch, account]);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, provider?.getSigner());
  }, [provider, host]);

  // update user votes on proposal updates
  useEffect(() => {
    if (!proposals) return;
    setUserVotes(extractAllVotes(proposals, account ? account : ''));
  }, [proposals, account]);

  const handleUserVote = async (direction: Direction, proposalId: number) => {
    if (!delegatedVotes || !userVotes) return;

    setShowModal(true);
    try {
      setVotingAlert({
        title: 'Voting',
        content:
          direction === Direction.Up
            ? `Please sign the message to vote for proposal #${proposalId}`
            : `Please sign the message to remove your vote on proposal #${proposalId}`,
      });

      await client.current.logVote(new Vote(direction, proposalId));

      setVotingAlert({
        title: 'Success',
        content:
          direction === Direction.Up
            ? `You have successfully voted for proposal #${proposalId}`
            : `You have successfully removed a vote for proposal #${proposalId}`,
      });

      refreshActiveProposals(client.current, auction.id, dispatch);
    } catch (e) {
      setVotingAlert({
        title: 'Error',
        content:
          direction === Direction.Up
            ? `Failed to vote on proposal #${proposalId}.\n\nError message: ${e}`
            : `Failed to remove vote on proposal #${proposalId}.\n\nError message: ${e}`,
      });
    }
  };

  const handleResubmission = async (
    proposal: StoredProposal,
    auctionIdToSubmitTo: number
  ) => {
    await client.current.createProposal(
      new Proposal(
        proposal.title,
        proposal.who,
        proposal.what,
        proposal.timeline,
        proposal.links,
        auctionIdToSubmitTo
      )
    );
  };

  const cardStatus = (proposalId: number): ProposalCardStatus => {
    // if not in voting or not eligible to vote, return default
    return auctionStatus(auction) !== AuctionStatus.AuctionVoting ||
      delegatedVotes === undefined
      ? ProposalCardStatus.Default
      : ProposalCardStatus.Voting;
  };

  return (
    <>
      {showModal && (
        <Modal
          title={votingAlert?.title}
          content={votingAlert?.content}
          onDismiss={() => setShowModal(false)}
        />
      )}
      <Row>
        {proposals &&
          proposals
            .slice(0, showAllProposals ? proposals.length : 6)
            .map((proposal, index) => {
              return (
                <Col key={index} xl={4}>
                  <ProposalCard
                    proposal={proposal}
                    auctionStatus={auctionStatus(auction)}
                    cardStatus={cardStatus(proposal.id)}
                    votesFor={
                      userVotes &&
                      countNumVotesForProposal(userVotes, proposal.id)
                    }
                    votesLeft={
                      delegatedVotes &&
                      userVotes &&
                      delegatedVotes - userVotes.length
                    }
                    handleUserVote={handleUserVote}
                    showResubmissionBtn={
                      auctionStatus(auction) === AuctionStatus.AuctionEnded &&
                      account === proposal.address
                    }
                    handleResubmission={handleResubmission}
                  />
                </Col>
              );
            })}
      </Row>
    </>
  );
};
export default ProposalCards;
