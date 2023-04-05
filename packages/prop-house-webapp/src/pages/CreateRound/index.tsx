import classes from './CreateRound.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../components/Card';
import Button, { ButtonColor } from '../../components/Button';

const CreateRound: React.FC<{}> = () => {
  return (
    <Container>
      <Row>
        <Col md={{ span: 8, offset: 2 }} className={classes.container}>
          <h1>Creating a round</h1>
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.ten}
            classNames={classes.card}
          >
            <h2>The Prop House protocol is coming soon™️!</h2>
            <p>
              We are working hard to turn Prop House into a protocol. Until then, creating new
              rounds is a bit manual. Please bear with us and learn how to set up your round or
              house below.
            </p>
          </Card>
          <div className={classes.step}>
            <h2>Fill out the form</h2>
            <p>
              Simply fill out our form with some basic information about your round. You’ll need to
              know the basics like the round timing, award amount, round and house name. Once filled
              out, you can expect your round to go live within 24 hours (usually much less).
            </p>
            <Button
              text="Create timed round"
              bgColor={ButtonColor.Purple}
              onClick={() =>
                window.open(
                  'https://www.addressform.io/f/58195583-4a62-4770-b3ed-667ddbd05c81',
                  '_blank',
                )
              }
            />
          </div>
          <div className={classes.step}>
            <h2>Questions?</h2>
            <p>
              If you're not sure what to do, or have any questions, please reach out to us via our
              <a href="https://discord.com/invite/SKPzM8GHts" target="_blank" rel="noreferrer">
                {' '}
                Discord server
              </a>
              .
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateRound;
