import { useNavigate, useParams } from 'react-router-dom';
import classes from './RoundManager.module.css';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import DepositAssetWidgets from '../../components/DepositAssetWidgets';
import { useEffect, useState } from 'react';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { isAddress } from 'viem';

const RoundManager = () => {
  const propHouse = usePropHouse();
  const navigate = useNavigate();
  const params = useParams();
  const { address } = params;

  const [round, setRound] = useState<RoundWithHouse>();
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    if (!address || !isAddress(address) || round || loading !== undefined) return;

    const fetchRound = async () => {
      try {
        setLoading(true);
        const round = await propHouse.query.getRoundWithHouseInfo(address);
        setRound(round);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    fetchRound();
  });

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : !round ? (
        <>error loading round</>
      ) : (
        <>
          <Row>
            <Col className={classes.linksCol}>
              <span onClick={() => navigate('/manage')}>Manage rounds →</span>{' '}
              <span>{round.title}</span>
            </Col>
          </Row>
          <Row>
            <Col className={classes.headerCol}>
              <div>
                <img src={round.house.imageURI} className={classes.houseImg} />
              </div>
              <div>
                <div className={classes.roundName}>{round.title}</div>
                <div>{round.address}</div>
              </div>
            </Col>
          </Row>
          <Row>
            <Tabs defaultActiveKey="rounds" className={classes.tabs}>
              <Tab eventKey="rounds" title="Deposit awards">
                <DepositAssetWidgets round={round} />
              </Tab>
              <Tab eventKey="activity" title="Cancel round">
                Cancel round
              </Tab>
            </Tabs>
          </Row>
        </>
      )}
    </Container>
  );
};

export default RoundManager;
