import { Claim, Deposit, Round, usePropHouse } from '@prophouse/sdk-react';
import React, { useEffect, useState } from 'react';
import useAssetsWithMetadata from '../../hooks/useAssetsWithMetadata';
import { Col, Row } from 'react-bootstrap';
import RelclaimAwardCard from '../RelclaimAwardCard';

const ReclaimAwardsWidget: React.FC<{ round: Round }> = ({ round }) => {
  const propHouse = usePropHouse();

  const [deposits, setDeposits] = useState<Deposit[]>();
  const [claims, setClaims] = useState<Claim[]>();

  const [loading, assetsWithMetadata] = useAssetsWithMetadata(deposits?.map(d => d.asset) ?? []);

  useEffect(() => {
    if (deposits !== undefined) return;
    const fetchDeposits = async () => {
      const deposits = await propHouse.query.getDeposits({ where: { round: round.address } });
      setDeposits(deposits);
    };
    fetchDeposits();
  });

  useEffect(() => {
    if (claims !== undefined) return;
    const fetchClaims = async () => {
      const claims = await propHouse.query.getClaims({ where: { round: round.address } });
      console.log('claims: ', claims);
      setClaims(claims);
    };
    fetchClaims();
  });

  return (
    <>
      <p>Awards can be reclaimed by the corresponding depositors if the round is cancelled.</p>
      <Row>
        {assetsWithMetadata &&
          deposits &&
          assetsWithMetadata.map((asset, i) => {
            return (
              <Col xl={4} key={i}>
                <RelclaimAwardCard asset={asset} deposit={deposits[i]} />
              </Col>
            );
          })}
      </Row>
    </>
  );
};

export default ReclaimAwardsWidget;
