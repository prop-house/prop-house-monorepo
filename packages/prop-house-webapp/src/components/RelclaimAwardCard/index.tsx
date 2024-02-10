import classes from './RelclaimAwardCard.module.css';
import { Deposit, Reclaim } from '@prophouse/sdk-react';
import React from 'react';
import { AssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import Button, { ButtonColor } from '../Button';
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ReclaimABI } from '../../abi/ReclaimABI';
import { assetTuple } from '../../utils/assetTuple';
import LoadingIndicator from '../LoadingIndicator';

enum ClaimStatus {
  NeedToConnect,
  AlreadyClaimed,
  NotEligible,
  Claim,
}

const RelclaimAwardCard: React.FC<{
  roundIsCancelled: boolean;
  asset: AssetWithMetadata;
  deposit: Deposit;
  reclaim?: Reclaim;
}> = ({ roundIsCancelled, asset, deposit, reclaim }) => {
  const { address: account } = useAccount();

  const claimed = reclaim !== undefined;
  const isDepositor = account?.toLowerCase() === deposit.depositor.toLowerCase();

  const claimStatus = !account
    ? ClaimStatus.NeedToConnect
    : isDepositor
    ? claimed
      ? ClaimStatus.AlreadyClaimed
      : ClaimStatus.Claim
    : ClaimStatus.NotEligible;

  const { config } = usePrepareContractWrite({
    address: deposit.round as `0x${string}`,
    abi: ReclaimABI,
    functionName: 'reclaim',
    args: [[assetTuple(asset)]],
  });

  const { isLoading, isSuccess, write } = useContractWrite(config);

  const buttonContent = () => {
    if (isLoading) return <LoadingIndicator color="white" height={20} width={30} />;
    if (isSuccess) return 'Awards have been reclaimed!';
    if (!roundIsCancelled) return 'Round not cancelled';
    switch (claimStatus) {
      case ClaimStatus.NeedToConnect:
        return 'Connect account';
      case ClaimStatus.AlreadyClaimed:
        return 'Already reclaimed';
      case ClaimStatus.NotEligible:
        return 'Not eligible to reclaim';
      case ClaimStatus.Claim:
        return 'Reclaim award';
    }
  };

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.ten}>
      <div className={classes.cardTopRow}>
        <div className={classes.assetImgAndName}>
          <img src={asset.tokenImg} className={classes.assetImg} alt="asset symbol" /> {asset.name}
        </div>
        <div>{asset.parsedAmount}</div>
      </div>

      <div className={classes.cardBottomRow}>
        <div>Deposited by:</div>
        <EthAddress address={deposit.depositor} className={classes.cardEthAddress} />
      </div>

      <Button
        bgColor={ButtonColor.Pink}
        text={buttonContent()}
        classNames={classes.cardBtn}
        disabled={
          !roundIsCancelled ||
          claimStatus === ClaimStatus.AlreadyClaimed ||
          claimStatus === ClaimStatus.NotEligible
        }
        onClick={claimStatus === ClaimStatus.Claim ? () => write?.() : undefined}
      />
    </Card>
  );
};

export default RelclaimAwardCard;
