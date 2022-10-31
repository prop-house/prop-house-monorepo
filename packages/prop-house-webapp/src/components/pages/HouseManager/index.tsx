import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import ManagerNamingSection from '../../ManagerNamingSection';
import ManagerDescriptionSection from '../../ManagerDescriptionSection';
import ManagerStrategiesSection from '../../ManagerStrategiesSection';

const HouseManager = () => {
  return (
    <>
      <Container>
        <Row className={classes.propCardsRow}>
          <Col xl={8} className={classes.cardsContainer}>
            <Card
              bgColor={CardBgColor.White}
              borderRadius={CardBorderRadius.thirty}
              classNames={classes.primaryCard}
            >
              <ManagerNamingSection />

              <hr className={classes.divider} />

              <ManagerDescriptionSection />

              <hr className={classes.divider} />

              <ManagerStrategiesSection />
            </Card>

            <Card
              bgColor={CardBgColor.White}
              borderRadius={CardBorderRadius.thirty}
              classNames={classes.secondaryCard}
            >
              <p>Create your House</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HouseManager;
