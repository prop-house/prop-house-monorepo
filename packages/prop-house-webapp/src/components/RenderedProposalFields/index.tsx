import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { ProposalFields } from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';

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
              submitted by <EthAddress address={address} />
            </div>
          )}
          <h2>Description</h2>
          <ReactMarkdown
            className={classes.markdown}
            children={fields.what}
          ></ReactMarkdown>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
