import { useNavigate, useParams } from 'react-router-dom';
import classes from './RoundManager.module.css';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import DepositAssetWidgets from '../../components/DepositAssetWidgets';
import { useEffect, useState } from 'react';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import LoadingIndicator from '../../components/LoadingIndicator';
import { isAddress } from 'viem';
import { FaArrowRightLong, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import trimEthAddress from '../../utils/trimEthAddress';
import { openInNewTab } from '../../utils/openInNewTab';
import buildEtherscanPath from '../../utils/buildEtherscanPath';
import CancelRoundWidget from '../../components/CancelRoundWidget';

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
      ) : !loading && !round ? (
        <>error loading round</>
      ) : (
        round && (
          <>
            <Row>
              <Col className={classes.linksCol}>
                <span onClick={() => navigate('/manage')}>
                  Manage rounds <FaArrowRightLong size={12} />
                </span>{' '}
                <span>{round.title}</span>
              </Col>
            </Row>
            <Row>
              <Col className={classes.headerCol}>
                <div>
                  <img src={round.house.imageURI} className={classes.houseImg} alt={round.title} />
                </div>
                <div>
                  <div className={classes.roundName}>{round.title}</div>
                  <div
                    className={classes.roundAddress}
                    onClick={() => openInNewTab(buildEtherscanPath(round.address))}
                  >
                    {trimEthAddress(round.address, 'long')} <FaArrowUpRightFromSquare size={12} />
                  </div>
                </div>
              </Col>
            </Row>
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
