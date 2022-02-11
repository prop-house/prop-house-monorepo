import {
  StoredProposal,
  StoredVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard, { ProposalCardStatus } from '../ProposalCard';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEffect, useState, useRef } from 'react';
import { useEthers } from '@usedapp/core';
import { AuctionStatus } from '../../utils/auctionStatus';

const ProposalCards: React.FC<{
  proposals: StoredProposal[];
  auctionStatus: AuctionStatus;
  isNouner: boolean;
}> = (props) => {
  const { proposals, auctionStatus, isNouner } = props;

  const { account } = useEthers();
  const [votes, setVotes] = useState<StoredVote[]>();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    if (!account) return;
    const fetchVotes = async () => {
      const votes = await client.current.getVotesByAddress(account);
      console.log(votes);
      setVotes(votes);
    };
    fetchVotes();
  }, [account]);

  return (
    <Row>
      {proposals.map((proposal, index) => {
        return (
          <Col key={index} xl={4}>
            <ProposalCard
              proposal={proposal}
              status={
                auctionStatus === AuctionStatus.AuctionVoting && isNouner
                  ? votes?.find((vote) => vote.proposalId === proposal.id)
                    ? ProposalCardStatus.VotedFor
                    : ProposalCardStatus.CanVoteFor
                  : ProposalCardStatus.Default
              }
            />
          </Col>
        );
      })}
    </Row>
  );
};
export default ProposalCards;
