import { Round, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import DepositWidget from '../DepositWidget';
import useAssetsWithMetadata from '../../hooks/useAssetsWithMetadata';
import { Col, Row } from 'react-bootstrap';
import { useAccount } from 'wagmi';

const DepositAssetWidgets: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const propHouse = usePropHouse();
  const { address: account } = useAccount();

  const [balances, setBalances] = useState<any[]>();
  const [_, assetsWithMetadata] = useAssetsWithMetadata(round.config.awards);

  useEffect(() => {
    if (!round || balances) return;
    const fetchBalances = async () => {
      const balances = await propHouse.query.getRoundBalances(round.address);
      setBalances(balances as any);
    };
    fetchBalances();
  });

  return (
    <Row>
      {assetsWithMetadata &&
        assetsWithMetadata.map(asset => (
          <Col xl={4}>
            <DepositWidget
              asset={asset}
              depositedAmount={'0'}
              accountConnected={account !== undefined}
              accountHasAssetToDeposit={false}
              isApproved={true}
              approve={() => {}}
              depositAsset={() => {}}
            />
          </Col>
        ))}
    </Row>
  );
};
export default DepositAssetWidgets;
