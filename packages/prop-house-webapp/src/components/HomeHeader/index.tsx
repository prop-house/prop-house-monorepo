import { Col, Row } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import classes from './HomeHeader.module.css';
import { Link } from 'react-router-dom';

const HomeHeader = () => {
  return (
    <Row className={classes.wrapper}>
      <Col xl={12} className={classes.leftCol}>
        <div className={classes.poweredByNouns}>
          Powered by{' '}
          <a href="https://nouns.wtf" target="_blank" rel="noreferrer">
            Nouns
          </a>
        </div>
        <h1>Plug into your community treasury</h1>
        <p>
          Bring your ideas to life by submitting a proposal to your community
          treasury. Funding rounds are held regularly and are available to
          anyone, anywhere.
        </p>
        <div className={classes.btnsContainer}>
          <Col xs={6} md="auto">
            <Link to="/learn">
              <Button text="Learn more" bgColor={ButtonColor.Pink} />
            </Link>
          </Col>
          <Col xs={6} md="auto">
            <Link to={`/explore`}>
              <Button text="View houses" bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </div>
      </Col>
    </Row>
  );
};

export default HomeHeader;
