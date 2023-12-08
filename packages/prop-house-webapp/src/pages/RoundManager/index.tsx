import { useLocation, useParams } from 'react-router-dom';
import classes from './RoundManager.module.css';
import { Container, Row, Tab, Tabs } from 'react-bootstrap';
import DepositAssetWidgets from '../../components/DepositAssetWidgets';
import { useEffect, useState } from 'react';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { isAddress } from 'viem';
import CancelRoundWidget from '../../components/CancelRoundWidget';
import ManagerHeader from '../../components/ManagerHeader';

const RoundManager = () => {
  const propHouse = usePropHouse();
  const params = useParams();
  const location = useLocation();
  const _stateRound = location.state?.round;

  const { address } = params;

  const [round, setRound] = useState<RoundWithHouse>(_stateRound ?? undefined);
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
      ) : !loading && !round ? (
        <>error loading round</>
      ) : (
        round && (
          <>
            <ManagerHeader
              title={round.title}
              imgUrl={round.house.imageURI ?? ''}
              address={round.address}
              type="round"
            />
            <Row>
              <Tabs defaultActiveKey="rounds" className={classes.tabs}>
                <Tab eventKey="rounds" title="Deposit awards">
                  <DepositAssetWidgets round={round} />
                </Tab>
                <Tab eventKey="activity" title="Cancel round">
                  <CancelRoundWidget round={round} />
                </Tab>
              </Tabs>
            </Row>
          </>
        )
      )}
    </Container>
  );
};

export default RoundManager;
