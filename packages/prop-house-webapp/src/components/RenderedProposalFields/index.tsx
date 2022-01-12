import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import proposalFields, { ProposalFields } from '../../utils/proposalFields';

export interface RenderedProposalProps {
fields: ProposalFields
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const {fields} = props;
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <h1>{fields.title}</h1>
          <h2>Who is building it?</h2>
          <p>{fields.who}</p>
          <h2>What are you building?</h2>
          <p>{fields.what}</p>
          <h2>What timeline do you expect to complete it by?</h2>
          <p>{fields.timeline}</p>
          <h2>Links relevant to your experience:</h2>
          <p>{fields.links}</p>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
