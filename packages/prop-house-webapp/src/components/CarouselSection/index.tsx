import classes from './CarouselSection.module.css';
import Button, { ButtonColor } from '../Button';
import { Row, Col } from 'react-bootstrap';
import Carousel from '../Carousel';
import React from 'react';

const CarouselSection: React.FC<{
  contextTitle: string;
  mainTitle: string;
  cards: React.ReactNode[];
}> = (props) => {
  const { contextTitle, mainTitle, cards } = props;
  return (
    <Row>
      <Col xl={12}>
        <div className={classes.header}>{contextTitle}</div>
        <div className={classes.titleRow}>
          <div className={classes.title}>{mainTitle}</div>
          <Button bgColor={ButtonColor.White} text="View all" />
        </div>
        <Carousel>{cards}</Carousel>
      </Col>
    </Row>
  );
};

export default CarouselSection;
