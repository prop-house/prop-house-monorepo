import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import clsx from 'clsx';
import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector((state) => state.editor.proposal);
  const { onDataChange } = props;
  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>Title</Form.Label>
              <Form.Control
                as="input"
                placeholder="Give your proposal a name..."
                className={classes.input}
                onChange={(e) => onDataChange({ title: e.target.value })}
                value={data && data.title}
              />
              <Form.Label className={classes.inputLabel}>tl;dr</Form.Label>
              <Form.Control
                as="input"
                placeholder="In the simplest language possible, explain your proposal in one sentence."
                className={classes.input}
                onChange={(e) => onDataChange({ tldr: e.target.value })}
                value={data && data.tldr}
              />
              <Form.Label className={classes.inputLabel}>
                Proposal description
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Project details: what are you building?&#10;Roadmap: when do you expect to complete it by?&#10;Team: who is building this?&#10;Links: share relevant links to the team and project"
                className={clsx(classes.input, classes.descriptionInput)}
                onChange={(e) => onDataChange({ what: e.target.value })}
                value={data && data.what}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
