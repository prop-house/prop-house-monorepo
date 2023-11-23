import { ERC721, Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import DepositWidget from '../DepositWidget';
import { useAssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import {
  erc721ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { erc721ApproveInterface } from '../../utils/contractABIs';

const DepositErc721Widget: React.FC<{
  asset: ERC721;
  round: Round;
  erc721RoundBalance?: RoundBalance;
}> = props => {
  const { asset, round, erc721RoundBalance } = props;

  const propHouse = usePropHouse();

  const [_, assetWithMetadata] = useAssetWithMetadata(asset);
  const [depositedAmount, setDepositedAmount] = useState<string>();
  const [hasErc721ToDeposit, setHasErc721ToDeposit] = useState<boolean>();
  const [isApproved, setIsApproved] = useState<boolean>();

  const { address: account } = useAccount();

  // check if user has erc721 to deposit
  const { data: ownerOfErc721 } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc721ABI,
    functionName: 'ownerOf',
    args: [BigInt(asset.tokenId.toString())],
  });

  useEffect(() => {
    if (!ownerOfErc721 || hasErc721ToDeposit !== undefined) return;
    setHasErc721ToDeposit(ownerOfErc721 === account);
  }, [ownerOfErc721, hasErc721ToDeposit, account]);

  // parse erc721 balance in round
  useEffect(() => {
    if (depositedAmount) return;
    setDepositedAmount(!erc721RoundBalance ? '0' : erc721RoundBalance.balance.toString());
  }, [erc721RoundBalance, depositedAmount]);

  // ph contract is approved to pull erc721
  const { data: approved } = useContractRead({
    address: asset.address as `0x${string}`,
    abi: erc721ABI,
    functionName: 'getApproved',
    args: [BigInt(asset.tokenId.toString())],
  });

  useEffect(() => {
    if (!approved || isApproved !== undefined) return;
    setIsApproved(approved === propHouse.contract.address);
  }, [approved, isApproved, propHouse.contract.address]);

  // request approval for ph contract to pull user's tokens
  const { config } = usePrepareContractWrite({
    address: asset.address as `0x${string}`,
    abi: erc721ApproveInterface,
    functionName: 'approve',
    args: [propHouse.contract.address, asset.tokenId],
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
      availAmountToDeposit={hasErc721ToDeposit ? '1' : '0'}
      isApproved={isApproved}
      approve={() => write?.()}
      depositAsset={deposit}
    />
  ) : (
    <>missing data</>
  );
};

export default DepositErc721Widget;
