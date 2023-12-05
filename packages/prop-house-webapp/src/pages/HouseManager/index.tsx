import classes from './HouseManager.module.css';
import React, { useEffect, useState } from 'react';
import ManagerHeader from '../../components/ManagerHeader';
import { House, usePropHouse } from '@prophouse/sdk-react';
import { useLocation, useParams } from 'react-router-dom';
import { isAddress } from 'viem';
import { Container, Row, Tab, Tabs } from 'react-bootstrap';
import LoadingIndicator from '../../components/LoadingIndicator';

const HouseManager: React.FC<{}> = () => {
  const propHouse = usePropHouse();
  const params = useParams();
  const location = useLocation();
  const _stateHouse = location.state?.house;

  const { address } = params;

  const [house, setHouse] = useState<House>(_stateHouse !== undefined ? _stateHouse : undefined);
  console.log(house);
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    if (!address || !isAddress(address) || house || loading !== undefined) return;

    const fetchHouse = async () => {
      try {
        setLoading(true);
        const house = await propHouse.query.getHouse(address);
        setHouse(house);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    fetchHouse();
  });

  return (
    <Container>
      {loading ? (
        <LoadingIndicator />
      ) : !loading && !house ? (
        <>error loading house</>
      ) : (
        house && (
          <>
            <ManagerHeader
              title={house.name ?? ''}
              imgUrl={house.imageURI ?? ''}
              address={house.address}
              type="house"
            />
            <Row>
              <Tabs defaultActiveKey="edit" className={classes.tabs}>
                <Tab eventKey="edit" title="Edit"></Tab>
              </Tabs>
            </Row>
          </>
        )
      )}
    </Container>
  );
};

export default HouseManager;
