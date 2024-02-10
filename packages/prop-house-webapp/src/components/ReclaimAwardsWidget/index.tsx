import { Deposit, Reclaim, Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import React, { useEffect, useState } from 'react';
import useAssetsWithMetadata from '../../hooks/useAssetsWithMetadata';
import { Col, Row } from 'react-bootstrap';
import RelclaimAwardCard from '../RelclaimAwardCard';
import { reclaimForDeposit } from '../../utils/reclaimForDeposit';

const ReclaimAwardsWidget: React.FC<{ round: Round }> = ({ round }) => {
  const propHouse = usePropHouse();

  const [deposits, setDeposits] = useState<Deposit[]>();
  const [reclaims, setReclaims] = useState<Reclaim[]>();
  // eslint-disable-next-line
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
    if (reclaims !== undefined) return;

    const fetchReclaims = async () => {
      const reclaims = await propHouse.query.getRoundReclaims(round.address);
      setReclaims(reclaims);
    };
    fetchReclaims();
  });

  return (
    <>
      <p>
        {round.state !== Timed.RoundState.CANCELLED &&
          `  Awards can be reclaimed by the corresponding depositors after the round is cancelled. ${round.title} has not yet been cancelled. `}
      </p>
      <Row>
        {assetsWithMetadata &&
          deposits &&
          reclaims &&
          assetsWithMetadata.map((asset, i) => {
            return (
              <Col xl={4} key={i}>
                <RelclaimAwardCard
                  roundIsCancelled={round.state === Timed.RoundState.CANCELLED}
                  asset={asset}
                  deposit={deposits[i]}
                  reclaim={reclaimForDeposit(deposits[i], reclaims)}
                />
              </Col>
            );
          })}
      </Row>
    </>
  );
};

export default ReclaimAwardsWidget;
