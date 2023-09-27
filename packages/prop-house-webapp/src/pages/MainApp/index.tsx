import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import RoundCard_ from '../../components/_RoundCard';
import { Col, Container, Row } from 'react-bootstrap';

const MainApp = () => {
  const prophouse = usePropHouse();
  const [rounds, setRounds] = useState<RoundWithHouse[]>();

  useEffect(() => {
    if (rounds) return;
    const fetchRounds = async () => setRounds(await prophouse.query.getRoundsWithHouseInfo());
    fetchRounds();
  });

  return (
    <Container>
      <Row>
        {rounds &&
          rounds.map(r => {
            return (
              <Col xl={6}>
                <RoundCard_ round={r} house={r.house} />
              </Col>
            );
          })}
      </Row>
    </Container>
  );
};

export default MainApp;
