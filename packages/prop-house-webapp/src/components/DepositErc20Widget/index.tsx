import { ERC20, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { erc20AllowanceInterface, erc20ApproveInterface } from '../../utils/contractABIs';

const DepositErc20Widget: React.FC<{
  asset: ERC20;
  round: Round;
  erc20RoundBalance?: RoundBalance;
}> = props => {
  const { asset, round, erc20RoundBalance } = props;

  const propHouse = usePropHouse();

  const [_, assetWithMetadata] = useAssetWithMetadata(asset);
  const [depositedAmount, setDepositedAmount] = useState<string>();
  const [availAmountToDeposit, setAvailAmountToDeposit] = useState<string>();
  const [hasRequiredAllowance, setHasRequiredAllowance] = useState<boolean>();

  const { address: account } = useAccount();
  const userErc20Balance = useBalance({ address: account, token: asset.address as `0x${string}` });

  // parse deposited token balance
  useEffect(() => {
    if (depositedAmount) return;
    setDepositedAmount(!erc20RoundBalance ? '0' : erc20RoundBalance.balance.toString());
  }, [erc20RoundBalance, depositedAmount]);

  // get user erc20 token balance
  useEffect(() => {
    if (!userErc20Balance.data) return;
    setAvailAmountToDeposit(userErc20Balance.data.value.toString());
  }, [userErc20Balance]);

  // allowance the prop house contract has to spend the user's tokens
  const { data: allowance } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc20AllowanceInterface,
    functionName: 'allowance',
    args: [account, propHouse.contract.address],
  });

  useEffect(() => {
    if (allowance === undefined) return;
    const _allowance = BigInt(allowance as string);
    setHasRequiredAllowance(_allowance >= BigInt(asset.amount.toString()));
  }, [allowance, asset.amount]);

  // request approval for ph contract to pull user's tokens
  const { config } = usePrepareContractWrite({
    address: asset.address as `0x${string}`,
    abi: erc20ApproveInterface,
    functionName: 'approve',
    args: [propHouse.contract.address, asset.amount],
  });
  const { write } = useContractWrite(config);

  const deposit = async (amount: string) => {
    try {
      const _asset = {
        ...asset,
        amount,
      };
      await propHouse.depositTo(round.address, _asset);
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
      isApproved={hasRequiredAllowance}
      approve={() => write?.()}
      depositAsset={deposit}
    />
  ) : (
    <>missing data</>
  );
};

export default DepositErc20Widget;
