import Card, { CardBgColor, CardBorderRadius } from '../Card';
import trimEthAddress from '../../utils/trimEthAddress';
import React from 'react';
import { Asset, AssetType } from '@prophouse/sdk-react';
import { TbFaceIdError } from 'react-icons/tb';
import LoadingIndicator from '../LoadingIndicator';

const DepositAssetWidgetInfoCard: React.FC<{
  asset: Asset;
  state: 'loading' | 'error';
}> = props => {
  const { asset, state } = props;

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      {state === 'loading' ? (
        <LoadingIndicator />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <div>
            <TbFaceIdError size={26} />
          </div>
          <div>
            Error loading data for asset with address{' '}
            {asset.assetType !== AssetType.ETH && trimEthAddress(asset.address)}
          </div>
        </div>
      )}
    </Card>
  );
};
export default DepositAssetWidgetInfoCard;
