import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard, { ProposalCardStatus } from '../ProposalCard';
import VotingBar from '../VotingBar';

const ProposalCards: React.FC<{
  proposals: StoredProposal[];
  showVoting: boolean;
}> = (props) => {
  const { proposals, showVoting } = props;
  return (
    <Row>
      {proposals.map((proposal, index) => {
        return (
          <Col key={index} xl={4}>
            <ProposalCard
              proposal={proposal}
              status={
                showVoting
                  ? ProposalCardStatus.CanVoteFor
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
