import { AssetType, Round } from '@prophouse/sdk-react';
import { Col, Row } from 'react-bootstrap';
import { mergeAssets } from '../../utils/mergeAssets';
import DepositEthWidget from '../DepositEthWidget';
import DepositErc20Widget from '../DepositErc20Widget';
import DepositErc721Widget from '../DepositErc721Widget';
import DepositErc1155Widget from '../DepositErc1155Widget';
import { useRoundBalances } from '../../hooks/useRoundBalances';

const DepositAssetWidgets: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const balances = useRoundBalances(round);

  return (
    <Row>
      {balances !== undefined &&
        mergeAssets(round.config.awards).map((asset, i) => (
          <Col key={i} xl={4}>
            {asset.assetType === AssetType.ETH ? (
              <DepositEthWidget
                asset={asset}
                round={round}
                ethRoundBalance={balances.find(b => b.asset.assetType === AssetType.ETH)}
              />
            ) : asset.assetType === AssetType.ERC20 ? (
              <DepositErc20Widget
                asset={asset}
                round={round}
                erc20RoundBalance={balances.find(b => b.asset.assetType === AssetType.ERC20)}
              />
            ) : asset.assetType === AssetType.ERC721 ? (
              <DepositErc721Widget
                asset={asset}
                round={round}
                erc721RoundBalance={balances.find(
                  b => b.asset.assetType === AssetType.ERC721 && b.asset.tokenId === asset.tokenId,
                )}
              />
            ) : (
              <DepositErc1155Widget
                asset={asset}
                round={round}
                erc1155RoundBalance={balances.find(
                  b => b.asset.assetType === AssetType.ERC1155 && b.asset.tokenId === asset.tokenId,
                )}
              />
            )}
          </Col>
        ))}
    </Row>
  );
};
export default DepositAssetWidgets;
