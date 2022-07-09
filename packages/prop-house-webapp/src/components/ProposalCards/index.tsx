import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';
import { useAppSelector } from '../../hooks';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { cardStatus } from '../../utils/cardStatus';
import { useEthers } from '@usedapp/core';
import extractAllVotes from '../../utils/extractAllVotes';
import { VoteAllotment } from '../../utils/voteAllotment';
import { aggVoteWeightForProp } from '../../utils/aggVoteWeight';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  voteAllotments: VoteAllotment[];
  canAllotVotes: () => boolean;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
}> = props => {
  const { auction, voteAllotments, canAllotVotes, handleVoteAllotment } = props;

  const { account } = useEthers();

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);

  // empty array to story
  const winningIds: number[] = [];
  const auctionEnded = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  auctionEnded &&
    proposals &&
    proposals
      .slice()
      .sort((a, b) => (Number(a.score) < Number(b.score) ? 1 : -1))
      .slice(0, auction.numWinners)
      .map(p => winningIds.push(p.id));

  return (
    <>
      <Row>
        {proposals &&
          proposals.map((proposal, index) => {
            return (
              <Col key={index} xl={4}>
                <ProposalCard
                  proposal={proposal}
                  auctionStatus={auctionStatus(auction)}
                  cardStatus={cardStatus(delegatedVotes ? delegatedVotes > 0 : false, auction)}
                  votesFor={aggVoteWeightForProp(
                    extractAllVotes(proposals ? proposals : [], account ? account : ''),
                    proposal.id,
                  )}
                  canAllotVotes={canAllotVotes}
                  voteAllotments={voteAllotments}
                  handleVoteAllotment={handleVoteAllotment}
                  winner={auctionEnded && winningIds.includes(proposal.id)}
                />
              </Col>
            );
          })}
      </Row>
    </>
  );
};
export default ProposalCards;
