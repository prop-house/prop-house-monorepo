import {
  StoredAuction,
  StoredVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useEffect, useRef, useState } from 'react';
import { auctionStatus } from '../../utils/auctionStatus';
import { cardStatus } from '../../utils/cardStatus';
import { setActiveProposals } from '../../state/slices/propHouse';
import { useEthers } from '@usedapp/core';
import countNumVotesForProposal from '../../utils/countNumVotesForProposal';
import extractAllVotes from '../../utils/extractAllVotes';
import { Direction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import Modal, { ModalData } from '../Modal';
import { VoteAllotment } from '../../utils/voteAllotment';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  voteAllotments: VoteAllotment[];
  canAllotVotes: () => boolean;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
}> = (props) => {
  const { auction, voteAllotments, canAllotVotes, handleVoteAllotment } = props;

  const dispatch = useAppDispatch();
  const { account, library: provider } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [userVotes, setUserVotes] = useState<StoredVote[]>();
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData>();

  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  useEffect(() => {
    client.current = new PropHouseWrapper(host, provider?.getSigner());
  }, [provider, host]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));
      setUserVotes(extractAllVotes(proposals, account ? account : ''));
    };
    fetchAuctionProposals();
  }, [auction.id, dispatch, account]);

  // update user votes on proposal updates
  useEffect(() => {
    if (!proposals) return;
    setUserVotes(extractAllVotes(proposals, account ? account : ''));
  }, [proposals, account]);

  const handleUserVote = async (direction: Direction, proposalId: number) => {
    if (!delegatedVotes || !userVotes) return;

    setShowModal(true);
    try {
      setModalData({
        title: 'Voting',
        content:
          direction === Direction.Up
            ? `Please sign the message to vote for proposal #${proposalId}`
            : `Please sign the message to remove your vote on proposal #${proposalId}`,
        onDismiss: () => setShowModal(false),
      });

      await client.current.logVote(new Vote(direction, proposalId));

      setModalData({
        title: 'Success',
        content:
          direction === Direction.Up
            ? `You have successfully voted for proposal #${proposalId}`
            : `You have successfully removed a vote for proposal #${proposalId}`,
        onDismiss: () => setShowModal(false),
      });

      refreshActiveProposals(client.current, auction.id, dispatch);
    } catch (e) {
      setModalData({
        title: 'Error',
        content:
          direction === Direction.Up
            ? `Failed to vote on proposal #${proposalId}.\n\nError message: ${e}`
            : `Failed to remove vote on proposal #${proposalId}.\n\nError message: ${e}`,
        onDismiss: () => setShowModal(false),
      });
    }
  };

  return (
    <>
      {showModal && modalData && <Modal data={modalData} />}
      <Row>
        {proposals &&
          proposals.map((proposal, index) => {
            return (
              <Col key={index} xl={4}>
                <ProposalCard
                  proposal={proposal}
                  auctionStatus={auctionStatus(auction)}
                  cardStatus={cardStatus(
                    delegatedVotes ? delegatedVotes > 0 : false,
                    auction
                  )}
                  votesFor={countNumVotesForProposal(
                    userVotes ? userVotes : [],
                    proposal.id
                  )}
                  canAllotVotes={canAllotVotes}
                  voteAllotments={voteAllotments}
                  handleVoteAllotment={handleVoteAllotment}
                />
              </Col>
            );
          })}
      </Row>
    </>
  );
};
export default ProposalCards;
