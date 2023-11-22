import { AssetType, ETH, PropHouse, Round, RoundBalance } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { AssetWithMetadata, useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';

const DepositEthWidget: React.FC<{
  asset: AssetWithMetadata;
  round: Round;
  propHouse: PropHouse;
  balances: RoundBalance[];
}> = props => {
  const { asset, round, propHouse, balances } = props;

  const [depositedAmount, setDepositedAmount] = useState<string>();
  const [availAmountToDeposit, setAvailAmountToDeposit] = useState<string>();

  const { address: account } = useAccount();
  const ethBalance = useBalance({ address: account });
  const [_, assetWithMetadata] = useAssetWithMetadata(asset);

  // parse deposited eth balance
  useEffect(() => {
    if (!balances || balances.length === 0) return;

    const ethBalance = balances.find(b => b.asset.assetType === AssetType.ETH);
    const ethAsset = ethBalance?.asset as ETH;

    setDepositedAmount(!ethBalance || !ethAsset ? '0' : ethAsset.amount.toString());
  }, [balances]);

  // get user eth balance
  useEffect(() => {
    if (!ethBalance.data) return;
    setAvailAmountToDeposit(ethBalance.data.value.toString());
  }, [ethBalance]);

  const deposit = async (amount: string) => {
    try {
      const asset = {
        assetType: 0,
        amount,
      };
      await propHouse.depositTo(round.address, asset);
    } catch (e) {
      console.log(e);
    }
  };

  return assetWithMetadata && depositedAmount && availAmountToDeposit ? (
    <DepositWidget
      asset={assetWithMetadata}
      depositedAmount={depositedAmount}
      accountConnected={account !== undefined}
      availAmountToDeposit={availAmountToDeposit}
      isApproved={true}
      depositAsset={deposit}
    />
  ) : (
    <>missing data</>
  );
};

export default DepositEthWidget;
