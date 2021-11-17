import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';

const ProposalCards = () => {
  return (
    <Row>
      {Array(6)
        .fill(0)
        .map(() => {
          return (
            <Col xl={6}>
              <ProposalCard />
            </Col>
          );
        })}
    </Row>
  );
};
export default ProposalCards;
