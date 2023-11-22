import { ERC1155, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
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

  const { address: account } = useAccount();

  // check if user has tokens to deposit
  const { data: balanceOf } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'balanceOf',
    args: [account ? account : ('' as `0x${string}`), BigInt(asset.tokenId.toString())],
  });

  useEffect(() => {
    if (!balanceOf || availAmountToDeposit !== undefined) return;
    setAvailAmountToDeposit(balanceOf.valueOf().toString());
  }, [balanceOf]);

  // parse token balance in round already
  useEffect(() => {
    if (depositedAmount !== undefined) return;

    setDepositedAmount(!erc1155RoundBalance ? '0' : erc1155RoundBalance.balance.toString());
  }, [erc1155RoundBalance]);

  // ph contract is approved to pull tokens
  const { data: approved } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'isApprovedForAll',
    args: [account ? account : ('' as `0x${string}`), propHouse.contract.address as `0x${string}`],
  });

  useEffect(() => {
    if (!approved || isApproved !== undefined) return;
    setIsApproved(approved);
  }, [approved]);

  // request approval for ph contract to pull user's tokens
  const { config } = usePrepareContractWrite({
    address: asset.address as `0x${string}`,
    abi: erc1155ABI,
    functionName: 'setApprovalForAll',
    args: [propHouse.contract.address as `0x${string}`, true],
  });
  const { write } = useContractWrite(config);

  const deposit = async () => {
    try {
      await propHouse.depositTo(round.address, asset);
    } catch (e) {
      console.log(e);
    }
  };

  return assetWithMetadata && depositedAmount ? (
    <DepositWidget
      asset={assetWithMetadata}
      depositedAmount={depositedAmount}
      accountConnected={account !== undefined}
      availAmountToDeposit={availAmountToDeposit ?? '0'}
      isApproved={isApproved}
      approve={() => write?.()}
      depositAsset={deposit}
    />
  ) : (
    <>missing data</>
  );
};

export default DepositErc1155Widget;
