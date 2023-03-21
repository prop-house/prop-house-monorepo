import classes from './SplitAwards.module.css';
import Text from '../Text';
import Group from '../Group';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { AssetType } from '@prophouse/sdk';
import NumberOfWinners from '../NumberOfWinners';
import Button, { ButtonColor } from '../../Button';
import { Award, newAward } from '../AssetSelector';
import { SetStateAction, useEffect, useState } from 'react';
import Modal from '../../Modal';
import ERC20Buttons from '../ERC20Buttons';
import { useAppSelector } from '../../../hooks';
import { getERC20Image } from '../utils/getERC20Image';
import { ERC20 } from '../WhoCanParticipate';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';
import TruncateThousands from '../../TruncateThousands';
import { getUSDPrice } from '../utils/getUSDPrice';
import { formatCommaNum } from '../utils/formatCommaNum';

export const erc20TokenAddresses: { [key in ERC20]: string } = {
  [ERC20.WETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ERC20.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [ERC20.APE]: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
  [ERC20.ETH]: '',
  [ERC20.OTHER]: '',
};
export const erc20Name: { [key in ERC20]: string } = {
  [ERC20.WETH]: 'Wrapped Ether',
  [ERC20.USDC]: 'USD Coin',
  [ERC20.APE]: 'Ape Coin',
  [ERC20.ETH]: 'Ethereum',
  [ERC20.OTHER]: '',
};

const SplitAwards: React.FC<{
  editMode?: boolean;
  awards: Award[];
  setAwards: React.Dispatch<SetStateAction<Award[]>>;
  winnerCount?: number;
  setWinnerCount?: React.Dispatch<React.SetStateAction<number>>;
}> = props => {
  const { editMode, awards, setAwards, winnerCount, setWinnerCount } = props;

  const [showSplitAwardModal, setShowSplitAwardModal] = useState(false);
  // const [award, setAward] = useState(newAward);

  const [award, setAward] = useState({ ...newAward, price: 0 });

  useEffect(() => {
    const shouldFetchEthPrice = !awards.length || awards[0].price === 0;

    if (shouldFetchEthPrice) {
      const fetchEthPrice = async () => {
        const ethPrice = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
        ).then(res => res.json());
        setAward(prevAward => ({ ...prevAward, price: ethPrice.ethereum.usd }));
      };
      fetchEthPrice();
    } else {
      // Set the award price based on the existing round data
      setAward(awards[0]);
    }
  }, [awards]);

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleSelectAward = async (token: ERC20) => {
    let updated: Partial<Award>;
    let type = token === ERC20.ETH ? AssetType.ETH : AssetType.ERC20;

    const { price } = await getUSDPrice(type, erc20TokenAddresses[token], award.amount);

    // TODO: when we select, we're changing UI under then modal, if we cancel, it persists, not good if we cancelled

    // when selecting a new asset, reset the amount to 1
    token === ERC20.OTHER
      ? (updated = {
          amount: 1,
          address: '',
          state: 'input',
          selectedAsset: ERC20.OTHER,
          type: AssetType.ERC20,
        })
      : (updated = {
          amount: 1,
          state: 'success',
          selectedAsset: token,
          name: erc20Name[token],
          symbol: token,
          price,
          address: erc20TokenAddresses[token],
          type,
        });
    console.log('changed!', price, erc20Name[token], erc20TokenAddresses[token]);
    setAward({ ...award, ...updated });
  };

  const handleAwardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;

    setAward({ ...award, amount: value });
  };

  // const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  //   const clipboardData = e.clipboardData.getData('text');
  //   let value = parseInt(clipboardData, 10);

  //   if (isNaN(value) || value < 1) {
  //     e.preventDefault();
  //     return;
  //   }
  // };

  // const inputHasError = award.state === 'Error';

  const handleAwardsSave = () => {
    let updated: Partial<Award>;

    updated = {
      state: 'success',
      type: award.type,
      symbol: award.symbol,
      name: award.name,
      selectedAsset: award.selectedAsset,
      address: erc20TokenAddresses[award.selectedAsset] || award.address,
      image: getERC20Image(award.selectedAsset) || award.image,
    };

    setAward({ ...award, ...updated });
    setAwards([{ ...award, ...updated }]);
    dispatch(updateRound({ ...round, awards: [{ ...award, ...updated }] }));
    setShowSplitAwardModal(false);
  };

  const handleNumWinnersChange = (amount: number) => {
    if (editMode) {
      setWinnerCount!(amount);
    } else {
      dispatch(updateRound({ ...round, numWinners: amount }));
      dispatch(checkStepCriteria());
    }
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(award.address);

  //  TODO
  const [isTyping, setIsTyping] = useState(false);

  const handleAwardAddressBlur = async () => {
    setIsTyping(false);
    // if address is empty, dont do anything
    if (!award.address) {
      setAward({ ...award, state: 'input' });
      return;
    }
    // if address isn't valid, set error
    if (!data) {
      setAward({ ...award, state: 'error', error: 'Invalid address' });
      return;
    }
    if (AssetType[award.type] !== data) {
      setAward({ ...award, state: 'error', error: `Expected ERC20 and got ${data}` });
      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const tokenInfo = await getTokenInfo(award.address);
      const { name, collectionName, image, symbol } = tokenInfo;
      const { price } = await getUSDPrice(award.type, award.address, award.amount);

      if (!name || !image) {
        setAward({ ...award, state: 'error', error: 'Unidentifed address' });

        return;
      } else {
        setAward({
          ...award,
          state: 'success',
          name: name === 'Unidentified contract' ? collectionName : name,
          image,
          symbol,
          price,
        });
      }
    }
  };

  const handleSwitchInput = () => setAward({ ...award, state: 'input' });

  const handleAwardAddressChange = (value: string) => {
    setIsTyping(true);
    setAward({ ...award, address: value });
  };

  const handleModalClose = () => {
    // TODO - if a selection has been made & saved, then they open it back up, make a selection but dont save, then close the modal, the selection is still saved. Need to reset the state to the original selection.

    setShowSplitAwardModal(false);
  };

  return (
    <>
      {showSplitAwardModal && (
        <Modal
          title="Edit award"
          subtitle=""
          body={
            <>
              <ERC20Buttons
                award={award}
                isTyping={isTyping}
                handleSwitch={handleSwitchInput}
                handleBlur={handleAwardAddressBlur}
                handleSelectAward={handleSelectAward}
                handleChange={handleAwardAddressChange}
              />
              <Group gap={6} mt={12}>
                <Text type="subtitle">Amount</Text>
                <input
                  className={classes.input}
                  type="number"
                  placeholder="3"
                  onChange={handleAwardInputChange}
                  value={award.amount}
                />
              </Group>
            </>
          }
          button={<Button text={'Cancel'} bgColor={ButtonColor.White} onClick={handleModalClose} />}
          secondButton={
            <Button
              text={'Save Changes'}
              bgColor={ButtonColor.Purple}
              onClick={handleAwardsSave}
              disabled={!(award.state === 'success')}
            />
          }
          setShowModal={setShowSplitAwardModal}
        />
      )}

      <Group row gap={editMode ? 20 : 45} mb={6}>
        <Group row gap={editMode ? 6 : 16} classNames={classes.fullWidth}>
          <Group gap={4} classNames={classes.inputContainer}>
            <Text type="subtitle">Total awards</Text>

            <div className={classes.award}>
              <div className={classes.awardImgAndAmount}>
                <img src={awards[0].image} alt={awards[0].name} />

                <span className={classes.awardAmount}>
                  <TruncateThousands amount={awards[0].amount} decimals={2} />
                </span>
                <span className={classes.awardName}>{awards[0].symbol || awards[0].name}</span>
              </div>

              {!editMode && <div>${formatCommaNum(award.price * award.amount)}</div>}
            </div>
          </Group>

          <Button
            text="Edit"
            classNames={classes.editButton}
            onClick={() => setShowSplitAwardModal(true)}
            bgColor={ButtonColor.White}
          />
        </Group>

        <Group classNames={classes.fullWidth}>
          <NumberOfWinners
            editMode
            winners={editMode ? winnerCount! : round.numWinners}
            disabled={false}
            handleNumWinnersChange={handleNumWinnersChange}
          />
        </Group>
      </Group>

      <Text type="body">
        <TruncateThousands amount={editMode ? winnerCount! : round.numWinners} decimals={2} />{' '}
        winner
        {(editMode ? winnerCount === 1 : round.numWinners === 1) ? '' : 's'} will receive{' '}
        <TruncateThousands amount={awards[0].amount} decimals={2} />{' '}
        {awards[0].symbol || awards[0].name} ($
        {formatCommaNum(award.price * award.amount)})
        {(editMode ? winnerCount === 1 : round.numWinners === 1) ? '' : 'each'}.
      </Text>
    </>
  );
};

export default SplitAwards;
