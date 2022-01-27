import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import proposalFields, { ProposalFields } from '../../utils/proposalFields';

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
          <hr />
          <h2>Builders</h2>
          <p>{fields.who}</p>
          <hr />
          <h2>Timeline</h2>
          <p>{fields.timeline}</p>
          <hr />
          <h2>Links</h2>
          <p>{fields.links}</p>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
