import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { ProposalFields } from '../../utils/proposalFields';

export interface RenderedProposalProps {
  fields: ProposalFields;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const { fields } = props;
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <h1>{fields.title}</h1>
          <hr />
          <h2>Description</h2>
          <p>{fields.what}</p>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
