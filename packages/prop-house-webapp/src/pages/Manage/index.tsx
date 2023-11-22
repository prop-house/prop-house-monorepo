import { House, Round, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useAccount } from 'wagmi';
import RoundCard from '../../components/RoundCard';
import { useNavigate } from 'react-router-dom';

const Manage = () => {
  const [rounds, setRounds] = useState<Round[]>();
  const [houses, setHouses] = useState<House[]>();

  const propHouse = usePropHouse();
  const navigate = useNavigate();
  const { address: account } = useAccount();

  useEffect(() => {
    if (!account || rounds) return;

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
        <h5>Manage Rounds</h5>
        {rounds &&
          houses &&
          rounds.map((r, i) => (
            <Col key={i} xl={6}>
              <RoundCard
                round={r}
                house={houses[0]}
                displayBottomBar={false}
                onClick={() => navigate(`/manage/${r.address}`, { replace: true })}
              />
            </Col>
          ))}
      </Row>
    </Container>
  );
};

export default Manage;
