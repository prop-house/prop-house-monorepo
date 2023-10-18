import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import RoundCard_ from '../../components/_RoundCard';
import { Col, Container, Row } from 'react-bootstrap';

const MainApp = () => {
  const prophouse = usePropHouse();
  const [rounds, setRounds] = useState<RoundWithHouse[]>();

  useEffect(() => {
    if (rounds) return;

    const fetchRounds = async () => {
      try {
        setRounds(await prophouse.query.getRoundsWithHouseInfo());
      } catch (e) {
        console.log(e);
      }
    };
    fetchRounds();
  });

  return (
    <Container>
      <Row>
        {rounds &&
          rounds.map((round, i) => {
            return (
              <Col xl={6} key={i}>
                <RoundCard_ round={round} house={round.house} />
              </Col>
            );
          })}
      </Row>
    </Container>
  );
};

export default MainApp;
