import classes from './Learn.module.css';
import { Row, Col, Image } from 'react-bootstrap';
import grempBulb from '../../../assets/gremp-lightbulb.png';
import clsx from 'clsx';

const Learn = () => {
  return (
    <>
      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row)}>
          <Col xl={{ span: 5, offset: 1 }}>
            <h2>This is a statement</h2>
            <p>
              Proin tristique at lorem id molestie. Morbi elementum hendrerit
              nisi, eget luctus urna euismod in. Nam tempor ligula et faucibus
              rutrum. Praesent in tempus nibh. Integer diam tortor, porttitor in
              consectetur ac, pretium quis ex. Sed interdum condimentum
              porttitor. In faucibus iaculis ex eu pharetra.
            </p>
          </Col>
          <Col xl={6} className={classes.rightCol}>
            <Image src={grempBulb} fluid className={classes.img} />
          </Col>
        </Row>
      </div>

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row)}>
          <Col xl={6} className={classes.leftCol}>
            <Image src={grempBulb} fluid className={classes.img} />
          </Col>
          <Col xl={{ span: 6, offset: 0 }}>
            <h2>This is a statement</h2>
            <p>
              Proin tristique at lorem id molestie. Morbi elementum hendrerit
              nisi, eget luctus urna euismod in. Nam tempor ligula et faucibus
              rutrum. Praesent in tempus nibh. Integer diam tortor, porttitor in
              consectetur ac, pretium quis ex. Sed interdum condimentum
              porttitor. In faucibus iaculis ex eu pharetra.
            </p>
          </Col>
        </Row>
      </div>

      <div className={clsx('break-out', classes.breakOutMobile)}>
        <Row className={clsx('g-0', classes.row)}>
          <Col xl={{ span: 5, offset: 1 }}>
            <h2>This is a statement</h2>
            <p>
              Proin tristique at lorem id molestie. Morbi elementum hendrerit
              nisi, eget luctus urna euismod in. Nam tempor ligula et faucibus
              rutrum. Praesent in tempus nibh. Integer diam tortor, porttitor in
              consectetur ac, pretium quis ex. Sed interdum condimentum
              porttitor. In faucibus iaculis ex eu pharetra.
            </p>
          </Col>
          <Col xl={6} className={classes.rightCol}>
            <Image src={grempBulb} fluid className={classes.img} />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Learn;
