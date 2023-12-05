import classes from './Dashboard.module.css';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useAccount } from 'wagmi';
import RoundCard from '../../components/RoundCard';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import ConnectToContinue from '../../components/ConnectToContinue';
import { NounImage } from '../../utils/getNounImage';
import Button, { ButtonColor } from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';

const Dashboard = () => {
  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [loading, setLoading] = useState(false);

  const propHouse = usePropHouse();
  const navigate = useNavigate();
  const { address: account } = useAccount();

  useEffect(() => {
    if (!account || rounds) return;

    const fetchRounds = async () => {
      try {
        setLoading(true);
        const rounds = await propHouse.query.getRoundsWithHouseInfoManagedByAccount(account);
        setLoading(false);
        setRounds(rounds);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    fetchRounds();
  });
  return (
    <Container>
      <PageHeader title="Dashboard" subtitle="Manage your communities and rounds" />
      <Row>
        {!account ? (
          <ConnectToContinue />
        ) : loading ? (
          <LoadingIndicator />
        ) : (
          rounds &&
          (rounds.length === 0 ? (
            <div className={classes.noRoundsDiv}>
              <img src={NounImage.Glasses.src} alt={NounImage.Glasses.alt} />
              <p>Your account hasn't created a round yet. </p>
              <Button
                text="Create a round"
                bgColor={ButtonColor.PurpleLight}
                onClick={() => navigate('/create-round')}
              />
            </div>
          ) : (
            <>
              {rounds.map((r, i) => (
                <Col key={i} xl={6}>
                  <RoundCard
                    round={r}
                    house={r.house}
                    displayBottomBar={false}
                    onClick={() => navigate(`/manage/${r.address}`, { replace: true })}
                  />
                </Col>
              ))}
            </>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
