import classes from './NotFound.module.css';
import hardhatNoun from '../../assets/hardhat-noun.png';
import Button, { ButtonColor } from '../Button';
import { Col, Container, Row } from 'react-bootstrap';

const NotFound = () => {
  return (
    <Container>
      <Row className={classes.invalidAddressCard}>
        <Col className={classes.imgContainer}>
          <img
            src={hardhatNoun}
            alt="invalid address noun"
            className={classes.invalidAddressNoun}
          />
        </Col>
        <Col className={classes.textContainer}>
          <h1>Seems we're lost</h1>
          <p>
            The page you're looking for does not exist. If you are here due to an old link, please
            visit the offchain version of Prop House to explore old rounds. Otherwise, please go
            home and explore new rounds.
          </p>
          <Button
            text="Go Home"
            onClick={() => window.location.replace('https://offchain.prop.house/')}
            bgColor={ButtonColor.PurpleLight}
          />
          <Button
            text="Explore old rounds"
            onClick={() => window.location.replace('/')}
            bgColor={ButtonColor.Purple}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
