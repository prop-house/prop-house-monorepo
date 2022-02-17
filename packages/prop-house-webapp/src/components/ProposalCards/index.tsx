import {
  StoredAuction,
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
  }, [proposals]);

  const handleUserVote = async (direction: Direction, proposalId: number) => {
    if (!delegatedVotes || !userVotes) return;

    // TODO: POLISH VOTING LOGIC IN BACKEND
    const vote = await client.current.logVote(new Vote(direction, proposalId));
    refreshActiveProposals(client.current, auction.id, dispatch);
  };

  const cardStatus = (proposalId: number): ProposalCardStatus => {
    // if not in voting or not nouner, return default
    return auctionStatus(auction) !== AuctionStatus.AuctionVoting ||
      delegatedVotes === undefined
      ? ProposalCardStatus.Default
      : ProposalCardStatus.Voting;
  };

  return (
    <Row>
      {proposals &&
        proposals
          .slice(0, showAllProposals ? proposals.length : 6)
          .map((proposal, index) => {
            return (
              <Col key={index} xl={4}>
                <ProposalCard
                  proposal={proposal}
                  status={cardStatus(proposal.id)}
                  votes={
                    userVotes &&
                    countNumVotesForProposal(userVotes, proposal.id)
                  }
                  handleUserVote={handleUserVote}
                />
              </Col>
            );
          })}
    </Row>
  );
};
export default ProposalCards;
