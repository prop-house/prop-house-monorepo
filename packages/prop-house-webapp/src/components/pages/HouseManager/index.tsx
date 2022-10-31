import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import ManagerPrimaryCard from '../../ManagerPrimaryCard';
import ManagerSecondaryCard from '../../ManagerSecondaryCard';
import { useState } from 'react';

const HouseManager = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <>
      <Container>
        <Row className={classes.propCardsRow}>
          <Col xl={8} className={classes.cardsContainer}>
            <ManagerPrimaryCard />

            <ManagerSecondaryCard activeStep={activeStep} setActiveStep={setActiveStep} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HouseManager;
