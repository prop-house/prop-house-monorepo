import classes from './CreateProposalCTA.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';
import { Form, Row, Col } from 'react-bootstrap';

const CreateProposalCTA = () => {
  return (
    <Row>
      <Col xl={12}>
        <Card bgColor={CardBgColor.Dark} borderRadius={CardBorderRadius.twenty}>
          <div className={classes.wrapper}>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Describe what you want funding for..."
              className={classes.formInput}
            />
            <Button text="Create proposal" bgColor={ButtonColor.Pink} />
            <Button text="About" bgColor={ButtonColor.White} />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateProposalCTA;
