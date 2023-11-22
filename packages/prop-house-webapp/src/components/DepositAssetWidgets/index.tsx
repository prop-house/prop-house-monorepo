import { AssetType, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { mergeAssets } from '../../utils/mergeAssets';
import DepositEthWidget from '../DepositEthWidget';
import DepositErc20Widget from '../DepositErc20Widget';

const DepositAssetWidgets: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const propHouse = usePropHouse();
  const [balances, setBalances] = useState<RoundBalance[]>();

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
      {balances &&
        mergeAssets(round.config.awards).map((asset, i) => (
          <Col key={i} xl={4}>
            {asset.assetType === AssetType.ETH ? (
              <DepositEthWidget
                asset={asset}
                round={round}
                ethRoundBalance={balances.find(b => b.asset.assetType === AssetType.ETH)}
              />
            ) : (
              asset.assetType === AssetType.ERC20 && (
                <DepositErc20Widget
                  asset={asset}
                  round={round}
                  erc20RoundBalance={balances.find(b => b.asset.assetType === AssetType.ERC20)}
                />
              )
            )}
          </Col>
        ))}
    </Row>
  );
};
export default DepositAssetWidgets;
