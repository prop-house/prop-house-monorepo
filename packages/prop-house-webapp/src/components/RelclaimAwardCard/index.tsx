import classes from './RelclaimAwardCard.module.css';
import { Deposit } from '@prophouse/sdk-react';
import React from 'react';
import { AssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import Button, { ButtonColor } from '../Button';
import { useAccount } from 'wagmi';

enum ClaimStatus {
  NeedToConnect,
  AlreadyClaimed,
  NotEligible,
  Claim,
}

const RelclaimAwardCard: React.FC<{ asset: AssetWithMetadata; deposit: Deposit }> = ({
  asset,
  deposit,
}) => {
  const { address: account } = useAccount();
  const claimed = false;

  const isDepositor = account?.toLowerCase() === deposit.depositor.toLowerCase();

  const claimStatus = !account
    ? ClaimStatus.NeedToConnect
    : isDepositor
    ? claimed
      ? ClaimStatus.AlreadyClaimed
      : ClaimStatus.Claim
    : ClaimStatus.NotEligible;

  const buttonCopy = () => {
    switch (claimStatus) {
      case ClaimStatus.NeedToConnect:
        return 'Connect account';
      case ClaimStatus.AlreadyClaimed:
        return 'Already claimed';
      case ClaimStatus.NotEligible:
        return 'Not eligible to claim';
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
        text={buttonCopy()}
        classNames={classes.cardBtn}
        disabled={
          claimStatus === ClaimStatus.AlreadyClaimed || claimStatus === ClaimStatus.NotEligible
        }
      />
    </Card>
  );
};

export default RelclaimAwardCard;
