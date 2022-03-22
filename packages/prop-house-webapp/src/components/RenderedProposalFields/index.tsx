import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { ProposalFields } from '../../utils/proposalFields';
import EthAddress from '../EthAddress';

export interface RenderedProposalProps {
  fields: ProposalFields;
  address?: string;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const { fields, address } = props;
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <h1>{fields.title}</h1>
          {address && (
            <div className={classes.submittedBy}>
              submitted by <EthAddress>{address}</EthAddress>
            </div>
          )}
          <h2>Description</h2>
          <p>{fields.what}</p>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
