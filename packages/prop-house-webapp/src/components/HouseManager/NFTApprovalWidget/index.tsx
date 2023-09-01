import classes from './NFTApprovalWidget.module.css';
import { useEffect, useState } from 'react';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useAccount,
} from 'wagmi';
import { AssetType, ChainId, usePropHouse } from '@prophouse/sdk-react';
import Group from '../Group';
import Text from '../Text';
import Button, { ButtonColor } from '../../Button';
import { Token } from '../../../state/slices/round';
import NFTApprovalModal from '../NFTApprovalModal';
import {
  erc721BalanceOfInterface,
  erc721SetApprovalForAllInterface,
  erc721IsApprovedForAllInterface,
  erc1155BalanceOfInterface,
  erc1155SetApprovalForAllInterface,
  erc1155IsApprovedForAllInterface,
} from '../utils/contractABIs';
import { BigNumber, BigNumberish } from 'ethers';
import trimEthAddress from '../../../utils/trimEthAddress';
import { Award } from '../AssetSelector';

const NFTApprovalWidget: React.FC<{
  award: Award;
  handleAllocation: (allocated: number, award: Token) => void;
}> = props => {
  const {
    award,
    // TODO - handle post-approval allocation update
    // handleAllocation,
  } = props;

  const [showNFTApprovalModal, setShowNFTApprovalModal] = useState(false);

  const { address: ownerAddress } = useAccount();

  // Select appropriate ABIs based on token type
  let balanceOfInterface, approveInterface, getApprovedInterface;

  let balanceArgs: (string | number)[] = [];

  if (award.type === AssetType.ERC721) {
    balanceOfInterface = erc721BalanceOfInterface;
    approveInterface = erc721SetApprovalForAllInterface;
    getApprovedInterface = erc721IsApprovedForAllInterface;
  }
  if (ownerAddress) {
    if (award.type === AssetType.ERC721) {
      balanceArgs = [ownerAddress];
    } else if (award.type === AssetType.ERC1155 && award.tokenId) {
      balanceArgs = [ownerAddress, award.tokenId];
    }
  }

  if (award.type === AssetType.ERC1155) {
    balanceOfInterface = erc1155BalanceOfInterface;
    approveInterface = erc1155SetApprovalForAllInterface;
    getApprovedInterface = erc1155IsApprovedForAllInterface;
  }

  //  -------- ------- ------- ------- ------- ------- --------
  //  -------- ------- ------- BALANCE OF ------- ------- -----
  //  -------- ------- ------- ------- ------- ------- --------
  const { data: tokenBalanceData, isLoading: balanceLoading } = useContractRead({
    address: (award.address as `0x${string}`) ?? '', // The address of the ERC20 token
    abi: balanceOfInterface,
    functionName: 'balanceOf',
    chainId: ChainId.EthereumGoerli,
    args: balanceArgs,
  });
  const tokenBalance: BigNumber | undefined =
    !balanceLoading && tokenBalanceData
      ? BigNumber.from(tokenBalanceData as any as BigNumberish)
      : undefined;

  //  -------- ------- ------- ------- ------- ------- --------
  //  -------- ------- ------- APPROVAL ------- ------- -------
  //  -------- ------- ------- ------- ------- ------- --------
  const propHouse = usePropHouse();
  const spenderAddress = propHouse.contract.address;

  const [isApproved, setIsApproved] = useState<boolean>(false);

  const { config } = usePrepareContractWrite({
    address: award.address as `0x${string}`,
    abi: approveInterface,
    functionName: 'setApprovalForAll',
    chainId: ChainId.EthereumGoerli,
    args: [spenderAddress, true],
  });

  const { data, isLoading, write } = useContractWrite(config);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const waitForTransaction = useWaitForTransaction({ hash: transactionHash as `0x${string}` });

  //  -------- ------- ------- ------- ------- ------- --------
  //  ------- ------- ------- ALLOWANCE ------- ------- -------
  //  -------- ------- ------- ------- ------- ------- --------
  const { data: allowance } = useContractRead({
    address: (award.address as `0x${string}`) ?? '', // The addrss of the ERC721 or ERC1155 token
    abi: getApprovedInterface,
    functionName: 'isApprovedForAll',
    chainId: ChainId.EthereumGoerli,
    args: [ownerAddress, spenderAddress],
  });

  useEffect(() => {
    if (tokenBalance?.gt(BigNumber.from('0'))) setIsApproved(Boolean(allowance));
  }, [allowance, tokenBalance]);

  useEffect(() => {
    if (data) setTransactionHash(data.hash as `0x${string}`);
  }, [data]);

  const handleClose = () => {
    setIsApproved(isApproved);
    setShowNFTApprovalModal(false);
  };

  const formatTokenId = (tokenId: string) =>
    tokenId.length > 10 ? trimEthAddress(tokenId) : tokenId;

  return (
    <>
      {showNFTApprovalModal && (
        <NFTApprovalModal
          award={award}
          setShowNFTApprovalModal={setShowNFTApprovalModal}
          status={{
            isLoading: waitForTransaction.isLoading,
            isSuccess: waitForTransaction.isSuccess,
            isError: waitForTransaction.isError,
            error: waitForTransaction.error,
          }}
          handleClose={handleClose}
          setIsApproved={setIsApproved}
        />
      )}

      {tokenBalance ? (
        <div className={classes.container}>
          <Group classNames={classes.row}>
            <Group row classNames={classes.row}>
              <Group row gap={4} classNames={classes.awardNameImg}>
                <div className={classes.imageContainer}>
                  <img
                    className={classes.image}
                    src={award.image || '/manager/fallback.png'}
                    alt="avatar"
                  />
                </div>

                <Text type="subtitle">{award.name}</Text>
              </Group>
            </Group>
          </Group>

          <Group classNames={classes.row}>
            {!isApproved ? (
              <Button
                classNames={classes.button}
                text={`Approve ${award.name || award.symbol}`}
                bgColor={ButtonColor.Pink}
                disabled={!write || isLoading}
                onClick={() => {
                  write!();
                  setShowNFTApprovalModal(true);
                }}
              />
            ) : (
              award.tokenId && <div>Token #{formatTokenId(award.tokenId)}</div>
            )}
          </Group>
        </div>
      ) : (
        <div className={classes.container} style={{ justifyContent: 'center' }}>
          <Text type="subtitle">{`No ${award.name || award.symbol} ${
            award.tokenId && `#${formatTokenId(award.tokenId)}`
          } found`}</Text>
        </div>
      )}
    </>
  );
};

export default NFTApprovalWidget;
