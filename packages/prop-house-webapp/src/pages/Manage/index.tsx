import { House, Round, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useAccount } from 'wagmi';
import RoundCard from '../../components/RoundCard';

const Manage = () => {
  const [rounds, setRounds] = useState<Round[]>();
  const [houses, setHouses] = useState<House[]>();

  const propHouse = usePropHouse();
  const { address: account } = useAccount();

  useEffect(() => {
    if (!account) return;

    const fetchRounds = async () => {
      try {
        const rounds = await propHouse.query.getRoundsManagedByAccount(account);
        const houses = await propHouse.query.getHousesWhereAccountIsOwnerOrHasCreatorPermissions(
          account,
        );
        setRounds(rounds);
        setHouses(houses);
      } catch (e) {
        console.log(e);
      }
    };
    fetchRounds();
  });
  return (
    <Container>
      <Row>
        <Col xl={6}>
          <h5>Manage Rounds</h5>
          {rounds &&
            houses &&
            rounds.map(r => <RoundCard round={r} house={houses[0]} displayBottomBar={true} />)}
        </Col>
      </Row>
    </Container>
  );
};

export default Manage;
