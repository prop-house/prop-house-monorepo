import classes from './Carousel.module.css';
import { Row, Col } from 'react-bootstrap';
import clsx from 'clsx';
import React from 'react';

const Carousel: React.FC<{}> = (props) => {
  return (
    <Row>
      <Col xl={12}>
        <div className={clsx(classes.carousel, 'break-out')}>
          {props.children}
        </div>
      </Col>
    </Row>
  );
};

export default Carousel;
