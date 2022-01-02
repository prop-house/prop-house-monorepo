import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import clsx from 'clsx';
import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector(state => state.editor.proposal)
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
            </Form.Group>

            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>
                Who is building it?
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Satoshi: engineer, Vitalik: designer and Timmy: project lead..."
                className={classes.input}
                onChange={(e) => onDataChange({ who: e.target.value })}
                value={data && data.who}
              />
            </Form.Group>

            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>
                What are you building?
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Please be as descriptive as possible"
                className={clsx(classes.input, classes.descriptionInput)}
                onChange={(e) => onDataChange({ what: e.target.value })}
                value={data && data.what}
              />
            </Form.Group>

            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>
                What timeline do you expect to complete it by?
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="e.g. Four weeks for phase 1, six weeks for phase 2"
                className={classes.input}
                onChange={(e) => onDataChange({ timeline: e.target.value })}
                value={data && data.timeline}
              />
            </Form.Group>

            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>
                Please share links relevant to your experience
              </Form.Label>
              <Form.Control
                as="textarea"
                placeholder="e.g. Bitcoin.org, Ethereum.org"
                className={classes.input}
                onChange={(e) => onDataChange({ links: e.target.value })}
                value={data && data.links}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
