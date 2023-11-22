import { ETH, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import { useAccount, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';

const DepositEthWidget: React.FC<{
  asset: ETH;
  round: Round;
  ethRoundBalance?: RoundBalance;
}> = props => {
  const { asset, round, ethRoundBalance } = props;

  const propHouse = usePropHouse();
  const [depositedAmount, setDepositedAmount] = useState<string>();
  const [availAmountToDeposit, setAvailAmountToDeposit] = useState<string>();

  const { address: account } = useAccount();
  const ethUserBalance = useBalance({ address: account });
  const [_, assetWithMetadata] = useAssetWithMetadata(asset);

  // parse deposited eth balance
  useEffect(() => {
    if (depositedAmount) return;
    setDepositedAmount(!ethRoundBalance ? '0' : ethRoundBalance.balance.toString());
  }, [ethRoundBalance]);

  // get user eth balance
  useEffect(() => {
    if (!ethUserBalance.data) return;
    setAvailAmountToDeposit(ethUserBalance.data.value.toString());
  }, [ethUserBalance]);

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
