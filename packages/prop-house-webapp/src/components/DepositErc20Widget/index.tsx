import { ERC20, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { erc20AllowanceInterface, erc20ApproveInterface } from '../../utils/contractABIs';
import { BigNumber } from 'ethers';

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
  const [loadingTx, setLoadingTx] = useState(false);
  const [postLoadMsg, setPostLoadMsg] = useState('');

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
    watch: true,
  });

  useEffect(() => {
    if (allowance === undefined || depositedAmount === undefined) return;
    const _allowance = BigNumber.from(allowance);
    const assetAmount = BigNumber.from(asset.amount.toString());
    const remainingBalance = assetAmount.sub(depositedAmount);
    setHasRequiredAllowance(_allowance.gte(remainingBalance));
  }, [allowance, asset.amount, depositedAmount]);

  // request approval for ph contract to pull user's tokens
  const { config } = usePrepareContractWrite({
    address: asset.address as `0x${string}`,
    abi: erc20ApproveInterface,
    functionName: 'approve',
    args: [propHouse.contract.address, asset.amount],
  });
  const { data: approveWriteTx, write } = useContractWrite(config);
  const { data: waitForApproveTx } = useWaitForTransaction({
    hash: approveWriteTx?.hash,
  });

  useEffect(() => {
    if (waitForApproveTx === undefined) return;
    setLoadingTx(false);
    setPostLoadMsg('Approval was successful');
    setTimeout(() => setPostLoadMsg(''), 10000);
  }, [waitForApproveTx, allowance]);

  const deposit = async (amount: string) => {
    try {
      setLoadingTx(true);
      const _asset = {
        ...asset,
        amount,
      };
      const tx = await propHouse.depositTo(round.address, _asset);
      await tx.wait();
      setLoadingTx(false);
      setPostLoadMsg('Deposit successful');
      setTimeout(() => setPostLoadMsg(''), 10000);
    } catch (e) {
      console.log(e);
      setLoadingTx(false);
      setPostLoadMsg('Deposit failed');
      setTimeout(() => setPostLoadMsg(''), 10000);
    }
  };

  return assetWithMetadata && depositedAmount && availAmountToDeposit ? (
    <DepositWidget
      asset={assetWithMetadata}
      depositedAmount={depositedAmount}
      accountConnected={account !== undefined}
      availAmountToDeposit={availAmountToDeposit}
      isApproved={hasRequiredAllowance}
      approve={() => {
        setLoadingTx(true);
        write?.();
      }}
      depositAsset={deposit}
      loading={loadingTx}
      postLoadMsg={postLoadMsg}
    />
  ) : (
    <>missing data</>
  );
};

export default DepositErc20Widget;
