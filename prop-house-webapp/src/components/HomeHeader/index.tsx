import { Col, Row, Image } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import classes from './HomeHeader.module.css';
import grempBulb from '../../assets/gremp-lightbulb.png';

const HomeHeader = () => {
  return (
    <Row>
      <Col xl={6}>
        <h1 className="display-1">Weekly funding for your ideas</h1>
        <p>
          Bring your ideas to life by submitting a proposal to Nouns DAO.
          Auctions are held regularly, and made available to anyone, anywhere.
          Get funded!
        </p>
        <div className={classes.btnContainer}>
          <Button text="Learn more" bgColor={ButtonColor.Pink} />
          <Button text="Submit proposal" bgColor={ButtonColor.White} />
        </div>
      </Col>
      <Col xl={{ span: 4, offset: 2 }}>
        <Image src={grempBulb} fluid />
      </Col>
    </Row>
  );
};

export default HomeHeader;
