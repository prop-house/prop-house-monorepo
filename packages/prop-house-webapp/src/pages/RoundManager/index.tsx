import { useNavigate } from 'react-router-dom';
import classes from './RoundManager.module.css';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import DepositAssets from '../../components/DepositAssets';

const RoundManager = () => {
  const navigate = useNavigate();

  const roundName = 'Round 1';
  const roundAddress = '0x123';

  return (
    <Container>
      <Row>
        <Col className={classes.linksCol}>
          <span onClick={() => navigate('/manage')}>Manage rounds →</span> <span>{roundName}</span>
        </Col>
      </Row>
      <Row>
        <Col className={classes.headerCol}>
          <div>
            <img src="/manager/eth.png" className={classes.houseImg} />
          </div>
          <div>
            <div className={classes.roundName}>{roundName}</div>
            <div>{roundAddress}</div>
          </div>
        </Col>
      </Row>
      <Row>
        <Tabs defaultActiveKey="rounds" className={classes.tabs}>
          <Tab eventKey="rounds" title="Deposit assets">
            <DepositAssets />
          </Tab>
          <Tab eventKey="activity" title="Cancel">
            Cancel round
          </Tab>
        </Tabs>
      </Row>
    </Container>
  );
};

export default RoundManager;
