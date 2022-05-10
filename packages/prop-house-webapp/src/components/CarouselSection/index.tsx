import classes from './CarouselSection.module.css';
import Button, { ButtonColor } from '../Button';
import { Row } from 'react-bootstrap';
import Carousel from '../Carousel';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CarouselSection: React.FC<{
  contextTitle: string;
  mainTitle: string;
  linkDest?: string;
  cards: React.ReactNode[];
}> = (props) => {
  const { contextTitle, mainTitle, cards, linkDest } = props;
  const navigate = useNavigate();
  return (
    <Row className={classes.row}>
      <div className={classes.header}>{contextTitle}</div>
      <div className={classes.titleRow}>
        <div className={classes.title}>{mainTitle}</div>
        {linkDest && (
          <Button
            bgColor={ButtonColor.White}
            text="View all"
            onClick={() => navigate(linkDest)}
          />
        )}
      </div>
      <Carousel>{cards}</Carousel>
    </Row>
  );
};

export default CarouselSection;
