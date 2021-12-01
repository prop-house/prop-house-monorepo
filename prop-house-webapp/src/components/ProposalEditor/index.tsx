import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import clsx from 'clsx';

const ProposalEditor: React.FC<{
  onTitleChange: (body: string) => void;
  onBodyChange: (body: string) => void;
}> = (props) => {
  const { onTitleChange, onBodyChange } = props;
  const descriptionPlaceholderCopy =
    '## What is it?\n\n## Who is building it?\n\n## Timeline?\n\n## Links to relevant work or experience';

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              <Form.Label className={classes.inputLabel}>Title</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Give your proposal a name..."
                className={classes.input}
                onChange={(e) => onTitleChange(e.target.value)}
              />
            </Form.Group>

            <Form.Group className={classes.inputGroup}>
              <Form.Control
                as="textarea"
                placeholder={descriptionPlaceholderCopy}
                className={clsx(classes.input, classes.descriptionInput)}
                onChange={(e) => onBodyChange(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
