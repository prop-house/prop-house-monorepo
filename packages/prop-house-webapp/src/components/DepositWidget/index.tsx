import classes from './DepositWidget.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Group from '../HouseManager/Group';
import Text from '../HouseManager/Text';
import { AssetWithMetadata } from '../../hooks/useAssetsWithMetadata';
import { ProgressBar } from 'react-bootstrap';
import { AssetType } from '@prophouse/sdk-react';
import { formatUnits, parseUnits } from 'viem';
import Button, { ButtonColor } from '../Button';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import { BigNumber } from 'ethers';

const DepositWidget: React.FC<{
  asset: AssetWithMetadata;
  depositedAmount: string;
  availAmountToDeposit: string;
  accountConnected: boolean;
  depositAsset: (amount: string) => void;
  isApproved?: boolean;
  approve?: () => void;
}> = props => {
  const {
    asset,
    depositedAmount,
    accountConnected,
    availAmountToDeposit,
    isApproved,
    approve,
    depositAsset,
  } = props;

  const { openConnectModal } = useConnectModal();
  const isErc721 = asset.assetType === AssetType.ERC721;

  const [inputValue, setInputValue] = useState<string>('');
  const [amountToDeposit, setAmountToDeposit] = useState<string>(isErc721 ? '1' : '0');

  const isFullyFunded = !isErc721
    ? BigNumber.from(depositedAmount).gte(asset.amount)
    : BigNumber.from(depositedAmount).eq(1);
  const accountHasAssetToDeposit = BigNumber.from(availAmountToDeposit).gt(0);

  const amountNeededToBeFullyFunded = isErc721
    ? BigNumber.from(1)
    : BigNumber.from(asset.amount).sub(depositedAmount);
  const percentageDeposited = isErc721
    ? isFullyFunded
      ? 1
      : 0
    : asset.decimals !== undefined &&
      Number(formatUnits(BigInt(depositedAmount), asset.decimals)) /
        Number(formatUnits(BigInt(asset.amount.toString()), asset.decimals));

  const parsedDepositedAmount =
    asset.decimals !== undefined && formatUnits(BigInt(depositedAmount.toString()), asset.decimals);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isErc721 || !asset.decimals) return;
    let value = e.target.value;

    // if it's not a number or a decimal, don't change the input
    if (isNaN(Number(value)) && !value.match(/^\d*\.?\d*$/)) return;

    setAmountToDeposit(parseUnits(value, asset.decimals).toString());
    setInputValue(value);
  };

  const handleAllClick = () => {
    if (isErc721 || asset.decimals === undefined || !amountNeededToBeFullyFunded) return;

    // use avail balance if it's less than the amount needed to be fully funded
    const amountToUse = BigNumber.from(availAmountToDeposit).gt(amountNeededToBeFullyFunded)
      ? amountNeededToBeFullyFunded
      : availAmountToDeposit;

    setAmountToDeposit(amountToUse.toString());
    setInputValue(formatUnits(BigInt(amountToUse.toString()), asset.decimals));
  };

  const inputAndDeposit = (
    <>
      {asset.assetType !== AssetType.ERC721 && (
        <Group>
          <Group row mb={5} classNames={classes.addAsset}>
            <Text type="body" classNames={classes.addAssetText}>
              Add asset:
            </Text>
            <Text type="link" classNames={classes.allText} onClick={handleAllClick}>
              All
            </Text>
          </Group>
          <Group mb={12}>
            <input
              className={classes.input}
              type="text"
              placeholder="0.0"
              value={inputValue}
              onChange={handleInputChange}
            />
          </Group>
        </Group>
      )}
      <Group>
        <Group>
          <Button
            text="Deposit"
            bgColor={ButtonColor.Pink}
            classNames={classes.bottomContentBtn}
            disabled={
              BigNumber.from(amountToDeposit).lte(0) ||
              BigNumber.from(amountToDeposit).gt(availAmountToDeposit) ||
              BigNumber.from(amountToDeposit).gt(amountNeededToBeFullyFunded)
            }
            onClick={() => depositAsset(amountToDeposit)}
          />
        </Group>
      </Group>
    </>
  );

  const bottomSection = (
    <Group classNames={classes.bottomContent}>
      {isFullyFunded ? (
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
          <Group row gap={4} classNames={classes.awardNameRow}>
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
            <ProgressBar now={percentageDeposited ? percentageDeposited * 100 : 0} />
            <ProgressBar
              now={100 - (percentageDeposited ? percentageDeposited * 100 : 0)}
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
