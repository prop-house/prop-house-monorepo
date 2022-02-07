import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';

const ProposalCards: React.FC<{
  proposals: StoredProposal[];
}> = (props) => {
  const { proposals } = props;
  return (
    <Row>
      {proposals.map((proposal, index) => {
        return (
          <Col key={index} xl={4}>
            <ProposalCard proposal={proposal} />
          </Col>
        );
      })}
    </Row>
  );
};
export default ProposalCards;
