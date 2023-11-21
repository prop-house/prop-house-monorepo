import classes from './DepositWidget.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Group from '../HouseManager/Group';
import Text from '../HouseManager/Text';
import { AssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import { ProgressBar } from 'react-bootstrap';
import { AssetType } from '@prophouse/sdk-react';
import { formatUnits } from 'viem';
import Button, { ButtonColor } from '../Button';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FaCheckCircle } from 'react-icons/fa';

const DepositWidget: React.FC<{
  asset: AssetWithMetadata;
  depositedAmount: string;
  accountConnected: boolean;
  accountHasAssetToDeposit: boolean;
  isApproved: boolean;
  approve: () => void;
  depositAsset: () => void;
}> = props => {
  const {
    asset,
    depositedAmount,
    accountConnected,
    accountHasAssetToDeposit,
    isApproved,
    approve,
    depositAsset,
  } = props;

  const fullyFunded = false;
  const percentageDeposited =
    asset.assetType === AssetType.ERC721
      ? BigInt(0)
      : BigInt(depositedAmount) / BigInt(asset.amount.toString());
  const parsedDepositedAmount =
    asset.decimals && formatUnits(BigInt(depositedAmount), asset.decimals);

  const { openConnectModal } = useConnectModal();

  const inputAndDeposit = (
    <>
      {asset.assetType !== AssetType.ERC721 && (
        <Group>
          <Group row mb={5} classNames={classes.addAsset}>
            <Text type="body" classNames={classes.addAssetText}>
              Add asset:
            </Text>
            <Text type="link" classNames={classes.allText}>
              All
            </Text>
          </Group>
          <Group mb={12}>
            <input className={classes.input} type="text" placeholder="0.0" />
          </Group>
        </Group>
      )}
      <Group>
        <Group>
          <Button
            text="Deposit"
            bgColor={ButtonColor.Pink}
            classNames={classes.bottomContentBtn}
            onClick={depositAsset}
          />
        </Group>
      </Group>
    </>
  );

  const bottomSection = (
    <Group classNames={classes.bottomContent}>
      {fullyFunded ? (
        <Group row classNames={classes.content}>
          Fully funded <FaCheckCircle />
        </Group>
      ) : !accountConnected ? (
        <Button
          text="Connect to deposit"
          bgColor={ButtonColor.Pink}
          classNames={classes.bottomContentBtn}
          onClick={openConnectModal}
        />
      ) : !accountHasAssetToDeposit ? (
        <Group row classNames={classes.content}>
          Account has no {asset.symbol} available
        </Group>
      ) : accountHasAssetToDeposit && !isApproved ? (
        <Button
          text={`Approve ${asset.symbol}`}
          bgColor={ButtonColor.Pink}
          classNames={classes.bottomContentBtn}
          onClick={approve}
        />
      ) : (
        accountHasAssetToDeposit && isApproved && inputAndDeposit
      )}
    </Group>
  );

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <Group classNames={classes.row}>
        <Group row classNames={classes.row}>
          <Group row gap={4} classNames={classes.awardNameImg}>
            <div className={classes.imageContainer}>
              <img
                className={classes.image}
                src={asset.tokenImg ? asset.tokenImg : '/manager/fallback.png'}
                alt="avatar"
              />
            </div>

            <Text type="subtitle">{asset.name}</Text>
          </Group>

          <Group row gap={4}>
            <Text type="body" classNames={classes.amount}>
              {asset.assetType === AssetType.ERC721
                ? `#${asset.tokenId}`
                : `${parsedDepositedAmount} of ${asset.parsedAmount} ${asset.symbol}`}
            </Text>
          </Group>
        </Group>

        <Group classNames={classes.progressBar}>
          <ProgressBar>
            <ProgressBar now={Number(percentageDeposited * BigInt(100))} />
            <ProgressBar
              now={Number(BigInt(100) - percentageDeposited * BigInt(100))}
              variant="warning"
            />
          </ProgressBar>
        </Group>
        {bottomSection}
      </Group>
    </Card>
  );
};

export default DepositWidget;
