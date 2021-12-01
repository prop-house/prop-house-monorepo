import classes from './Create.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import { Row, Col, Form } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const Create = () => {
  const descriptionPlaceholderCopy =
    'What will you be building?\n\nWho will you be building with?\n\nWhat timeline do you expect to complete the project?\n\nShare links to experience or supporting work relevant to your project';

  return (
    <>
      <Row>
        <Col xl={12}>
          <h1>Create proposal for Auction 1</h1>
          <p>Proposals will be voted by Nouners to get funded</p>
        </Col>
      </Row>
      <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
        <Row>
          <Col xl={10}>
            <p>
              We encourage proposals which further proliferate Nouns onto the
              world while accurately representing the Nouns culture. If your
              auction is chosen, you will be given the responsibility of
              completing the work you’ve outlined below. Please be descriptive!
            </p>
          </Col>
          <Col xl={2}>
            <Link to="/learn">
              <Button text="Learn more" bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </Row>
      </Card>
      <Row>
        <Form>
          <Form.Group className={classes.inputGroup}>
            <Form.Label className={classes.inputLabel}>Title</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Give your proposal a name..."
              className={classes.input}
            />
          </Form.Group>

          <Form.Group className={classes.inputGroup}>
            <Form.Label className={classes.inputLabel}>Description</Form.Label>
            <Form.Control
              as="textarea"
              placeholder={descriptionPlaceholderCopy}
              className={clsx(classes.input, classes.descriptionInput)}
            />
          </Form.Group>
        </Form>
      </Row>
      <Row>
        <Col xl={12} className={classes.connectBtnContainer}>
          <Button text="Connect wallet" bgColor={ButtonColor.Pink} />
          <span>to submit proposal</span>
        </Col>
      </Row>
    </>
  );
};

export default Create;
