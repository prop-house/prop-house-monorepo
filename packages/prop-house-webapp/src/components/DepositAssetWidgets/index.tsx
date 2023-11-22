import { AssetType, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import useAssetsWithMetadata from '../../hooks/useAssetsWithMetadata';
import { Col, Row } from 'react-bootstrap';
import { mergeAssets } from '../../utils/mergeAssets';
import DepositEthWidget from '../DepositEthWidget';

const DepositAssetWidgets: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const propHouse = usePropHouse();
  const [balances, setBalances] = useState<RoundBalance[]>();
  const [_, assetsWithMetadata] = useAssetsWithMetadata(mergeAssets(round.config.awards));

  useEffect(() => {
    if (!round || balances) return;
    const fetchBalances = async () => {
      const balances = await propHouse.query.getRoundBalances(round.address);
      setBalances(balances);
    };
    fetchBalances();
  }, [balances]);

  return (
    <Row>
      {assetsWithMetadata &&
        assetsWithMetadata.map((asset, i) => (
          <Col key={i} xl={4}>
            {asset.assetType === AssetType.ETH && balances && (
              <DepositEthWidget
                asset={asset}
                round={round}
                propHouse={propHouse}
                balances={balances}
              />
            )}
          </Col>
        ))}
    </Row>
  );
};
export default DepositAssetWidgets;
