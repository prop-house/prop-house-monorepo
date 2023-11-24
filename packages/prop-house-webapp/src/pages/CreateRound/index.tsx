import classes from './CreateRound.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import PrimaryCard from '../../components/HouseManager/PrimaryCard';
import SecondaryCard from '../../components/HouseManager/SecondaryCard';
import { useAppSelector } from '../../hooks';
import HouseNameAndImage from '../../components/HouseManager/HouseNameAndImage';

const CreateRound = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);

  return (
    <div className="manager">
      <Container>
        <Row>
          {activeStep > 1 && <HouseNameAndImage />}

          <Col xl={8} className={classes.cardsContainer}>
            <PrimaryCard />
            <SecondaryCard />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateRound;
