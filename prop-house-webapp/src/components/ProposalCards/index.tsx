import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';

const ProposalCards = () => {
  return (
    <Row>
      {Array(6)
        .fill(0)
        .map(() => {
          return (
            <Col xl={4}>
              <ProposalCard />
            </Col>
          );
        })}
    </Row>
  );
};
export default ProposalCards;
