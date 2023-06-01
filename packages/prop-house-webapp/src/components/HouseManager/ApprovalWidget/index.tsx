import classes from './ApprovalWidget.module.css';
// import { useState } from 'react';
import { useEffect, useState } from 'react';
import {
  useAccount,
  // useSigner,
  useBalance,
} from 'wagmi';
// import { Contract } from 'ethers';
import { AssetType } from '@prophouse/sdk-react';
import { Award } from '../AssetSelector';
import Group from '../Group';
import Text from '../Text';
import Button, { ButtonColor } from '../../Button';
import { ProgressBar } from 'react-bootstrap';

const ApprovalWidget: React.FC<{ award: Award; amount: number }> = props => {
  const {
    award,
    // amount
  } = props;
  const { address: account } = useAccount();
  // const { data: signer } = useSigner();
  // const { data: balance } = useBalance({ address: account });
  const { data: balance } = useBalance({
    address: account,
    // address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    // token: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    // chainId: 1,
  });

  useEffect(() => {
    // if (balance) console.log(`User's balance of ${award.symbol}: ${balance.toString()}`);
    if (balance) console.log(`b: ${balance}`);
  }, [balance, award.symbol]);

  async function handleApproval() {
    setIsApproved(true);
    // if (!signer || !account) {
    //   console.log('Please connect to a wallet.');
    //   return;
    // }

    // const contract = new Contract(
    //   award.address,
    //   ['function approve(address spender, uint amount) returns (bool)'],
    //   signer,
    // );

    // console.log('contract', contract);

    // try {
    //   const tx = await contract.approve(account, amount);
    //   console.log('tx', tx);
    //   await tx.wait(); // Wait for the transaction to be mined

    //   console.log(`Approved ${account} to spend ${amount} of ${award.symbol}`);
    // } catch (error) {
    //   console.error('Failed to approve tokens', error);
    // }
  }

  const amountTotal: number = 100;
  const [hasBeenClicked, setHasBeenClicked] = useState(true);
  const [approvedAmount, setApprovedAmount] = useState(0.0);

  const handleSwitch = () => setHasBeenClicked(!hasBeenClicked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // if it's not a number or a decimal, don't change the input
    if (isNaN(Number(value)) && !value.match(/^\d*\.?\d*$/)) return;

    setApprovedAmount(parseFloat(value) || 0.0);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleSwitch();
    let value = parseFloat(e.target.value);

    if (isNaN(value)) value = 0.0;

    if (value > amountTotal) setApprovedAmount(amountTotal);
    else if (value < 0) setApprovedAmount(0);
    else setApprovedAmount(value);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    let value = parseFloat(clipboardData);

    if (isNaN(value)) value = 0;

    if (value < 0) {
      // If value is negative, set to 0
      setApprovedAmount(0);
      return;
    }
    setApprovedAmount(value);
  };

  const [isApproved, setIsApproved] = useState(false);

  return (
    <div
      className={classes.container}
      //  onClick={handleApproval}
    >
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

          <Group row gap={4} classNames={classes.awardNameImg}>
            <Text type="body" classNames={classes.amount}>
              {award.type === AssetType.ERC1155 || award.type === AssetType.ERC721
                ? `#${award.tokenId}`
                : `${approvedAmount} of ${amountTotal} ${award.symbol || award.name}`}
            </Text>
          </Group>
        </Group>

        {award.type === AssetType.ETH || isApproved ? (
          <Group classNames={classes.progressBar}>
            <ProgressBar>
              <ProgressBar now={(approvedAmount / amountTotal) * 100} />
              <ProgressBar now={amountTotal - approvedAmount} variant="warning" />
            </ProgressBar>
          </Group>
        ) : (
          <></>
        )}
      </Group>

      <Group classNames={classes.row}>
        {award.type === AssetType.ETH || isApproved ? (
          <>
            <Group row classNames={classes.addFunds}>
              <Text type="body" classNames={classes.addFundsText}>
                Add funds:{' '}
              </Text>
              <Text
                type="link"
                onClick={() => setApprovedAmount(amountTotal)}
                disabled={approvedAmount === amountTotal}
                classNames={classes.maxText}
              >
                Max{' '}
              </Text>
            </Group>

            {hasBeenClicked ? (
              <button className={classes.addressSuccess} onClick={handleSwitch}>
                <p className={classes.amountText}>Amount</p>

                <p className={classes.approvedAmount}>{approvedAmount}</p>
              </button>
            ) : (
              <input
                className={classes.input}
                type="text"
                placeholder="0.0"
                value={approvedAmount.toString()}
                onChange={handleChange}
                onBlur={handleBlur}
                onPaste={handleInputPaste}
              />
            )}
          </>
        ) : (
          <Button
            classNames={classes.button}
            text={award.type === AssetType.ERC20 ? `Approve ${award.symbol}` : 'Select NFT'}
            bgColor={ButtonColor.Pink}
            onClick={
              award.type === AssetType.ERC20 ? handleApproval : () => console.log('Select NFT')
            }
          />
        )}
      </Group>
    </div>
  );
};

export default ApprovalWidget;
