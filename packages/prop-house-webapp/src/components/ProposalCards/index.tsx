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

const ProposalCards: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const dispatch = useAppDispatch();
  const { account } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [votes, setVotes] = useState<StoredVote[]>();
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));
      const votes = proposals
        .map((proposal: any) => proposal.votes)
        .flat()
        .filter((vote: any) => vote.address === account);
      setVotes(votes);
    };

    fetchAuctionProposals();
  }, [auction.id, dispatch, account]);

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
                  votes={votes && countNumVotesForProposal(votes, proposal.id)}
                />
              </Col>
            );
          })}
    </Row>
  );
};
export default ProposalCards;
