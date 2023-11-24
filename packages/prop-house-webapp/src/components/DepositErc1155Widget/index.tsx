import { ERC1155, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { erc1155ABI } from '../../abi/ERC1155ABI';

const DepositErc1155Widget: React.FC<{
  asset: ERC1155;
  round: Round;
  erc1155RoundBalance?: RoundBalance;
}> = props => {
  const { asset, round, erc1155RoundBalance } = props;

  const propHouse = usePropHouse();

  const [_, assetWithMetadata] = useAssetWithMetadata(asset);
  const [depositedAmount, setDepositedAmount] = useState<string>();
  const [availAmountToDeposit, setAvailAmountToDeposit] = useState<string>();
  const [isApproved, setIsApproved] = useState<boolean>();
  const [loadingTx, setLoadingTx] = useState(false);
  const [postLoadMsg, setPostLoadMsg] = useState('');

  const { address: account } = useAccount();

  // check if user has tokens to deposit
  const { data: balanceOf } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'balanceOf',
    args: [account ? account : ('' as `0x${string}`), BigInt(asset.tokenId.toString())],
    watch: true,
  });

  useEffect(() => {
    if (!balanceOf || availAmountToDeposit !== undefined) return;
    setAvailAmountToDeposit(balanceOf.valueOf().toString());
  }, [balanceOf, availAmountToDeposit]);

  // parse token balance in round already
  useEffect(() => {
    const newDepositedAmount = erc1155RoundBalance ? erc1155RoundBalance.balance.toString() : '0';
    if (newDepositedAmount !== depositedAmount) setDepositedAmount(newDepositedAmount);
  }, [erc1155RoundBalance, depositedAmount]);

  // ph contract is approved to pull tokens
  const { data: approved } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'isApprovedForAll',
    args: [account ? account : ('' as `0x${string}`), propHouse.contract.address as `0x${string}`],
    watch: true,
  });

  useEffect(() => {
    if (!approved || isApproved !== undefined) return;
    setIsApproved(approved);
  }, [approved, isApproved]);

  // request approval for ph contract to pull user's tokens
  const { config } = usePrepareContractWrite({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'setApprovalForAll',
    args: [propHouse.contract.address as `0x${string}`, true],
  });
  const { data: approveWriteTx, write } = useContractWrite(config);
  const { data: waitForApproveTx } = useWaitForTransaction({
    hash: approveWriteTx?.hash,
  });

  // wait for approval tx
  useEffect(() => {
    if (waitForApproveTx === undefined) return;
    setIsApproved(true);
    setLoadingTx(false);
    setPostLoadMsg('Approval was successful');
    setTimeout(() => setPostLoadMsg(''), 10000);
  }, [waitForApproveTx]);

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

  return assetWithMetadata && depositedAmount ? (
    <>
      <DepositWidget
        asset={assetWithMetadata}
        depositedAmount={depositedAmount}
        accountConnected={account !== undefined}
        availAmountToDeposit={availAmountToDeposit ?? '0'}
        isApproved={isApproved}
        approve={() => {
          setLoadingTx(true);
          write?.();
        }}
        depositAsset={deposit}
        loading={loadingTx}
        postLoadMsg={postLoadMsg}
      />
    </>
  ) : (
    <>missing data</>
  );
};

export default DepositErc1155Widget;
