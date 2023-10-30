import classes from './SplitAwards.module.css';
import Text from '../Text';
import Group from '../Group';
import { NewRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { AssetType } from '@prophouse/sdk-react';
import NumberOfWinners from '../NumberOfWinners';
import Button, { ButtonColor } from '../../Button';
import { Award, NewAward, erc20Name, erc20TokenAddresses } from '../AssetSelector';
import { SetStateAction, useEffect, useState } from 'react';
import Modal from '../../Modal';
import ERC20Buttons from '../ERC20Buttons';
import { useAppSelector } from '../../../hooks';
import { getERC20Image } from '../utils/getERC20Image';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';
import TruncateThousands from '../../TruncateThousands';
import { getUSDPrice } from '../utils/getUSDPrice';
import { formatCommaNum } from '../utils/formatCommaNum';
import useGetDecimals from '../utils/useGetDecimals';
import { saveRound } from '../../../state/thunks';
import { ERC20 } from '../AwardsConfig';
import { useEthersProvider } from '../../../hooks/useEthersProvider';

/**
 * @see editMode is used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const SplitAwards: React.FC<{
  editMode?: boolean;
  awards: Award[];
  setAwards: React.Dispatch<SetStateAction<Award[]>>;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, awards, setAwards, editedRound, setEditedRound } = props;

  const [isTyping, setIsTyping] = useState(false);
  const [award, setAward] = useState({ ...NewAward, price: 0 });
  const [showSplitAwardModal, setShowSplitAwardModal] = useState(false);

  const provider = useEthersProvider();
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  // Get address type by calling verification contract
  const { data } = useAddressType(award.address);

  // Get decimals of ERC20 token
  const { data: decimals } = useGetDecimals(award.address);

  useEffect(() => {
    const shouldFetchEthPrice = !awards.length || awards[0].price === 0;
    // If there are no awards, or the award price is 0, fetch the ETH price
    // Called once to fetch the ETH price of the initial award
    if (shouldFetchEthPrice) {
      const fetchEthPrice = async () => {
        const ethPrice = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`,
        ).then(res => res.json());
        setAward(prevAward => ({
          ...prevAward,
          price: ethPrice.ethereum.usd,
          selectedAsset: ERC20.ETH,
          state: 'success',
        }));
        setAwards([
          { ...award, price: ethPrice.ethereum.usd, selectedAsset: ERC20.ETH, state: 'success' },
        ]);
        dispatch(
          saveRound({
            ...round,
            awards: [
              {
                ...awards[0],
                price: ethPrice.ethereum.usd,
                selectedAsset: ERC20.ETH,
                state: 'success',
              },
            ],
          }),
        );
      };
      fetchEthPrice();
    } else {
      // Set the award price based on the existing round data
      setAward(awards[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectAward = async (token: ERC20) => {
    let updated: Partial<Award>;
    let type = token === ERC20.ETH ? AssetType.ETH : AssetType.ERC20;

    // fetch the price of the selected asset
    const { price } = await getUSDPrice(type, erc20TokenAddresses[token], provider);

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
          decimals:
            award.type === AssetType.ERC20 && decimals !== undefined ? (decimals as number) : 0,
        });

    setAward({ ...award, ...updated });
  };

  const handleAwardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // use parseFloat to convert string to number and allow for decimals
    let value = parseFloat(e.target.value);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;

    setAward({ ...award, amount: value });
  };

  const handleAwardsSave = () => {
    let updated: Partial<Award>;

    updated = {
      state: 'success',
      type: award.type,
      symbol: award.symbol,
      name: award.name,
      selectedAsset: award.selectedAsset,
      address: erc20TokenAddresses[award.selectedAsset!] || award.address,
      image: getERC20Image(award.selectedAsset!) || award.image,
    };

    setAward({ ...award, ...updated });
    setAwards([{ ...award, ...updated }]);

    if (editMode) {
      setEditedRound!({ ...editedRound!, awards: [{ ...award, ...updated }] });
    } else {
      dispatch(saveRound({ ...round, awards: [{ ...award, ...updated }] }));
    }

    setShowSplitAwardModal(false);
  };

  const handleNumWinnersChange = (amount: number) => {
    if (editMode) {
      setEditedRound!({ ...editedRound!, splitAwards: true, numWinners: amount });
    } else {
      dispatch(saveRound({ ...round, numWinners: amount }));
    }
  };

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
    // if address is not an ERC20, set error
    if (AssetType[award.type] !== data) {
      setAward({ ...award, state: 'error', error: `Expected ERC20 and got ${data}` });
      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const { name, image, symbol } = await getTokenInfo(award.address, provider);
      const { price } = await getUSDPrice(award.type, award.address, provider);

      setAward({
        ...award,
        state: 'success',
        name,
        symbol,
        image,
        price,
        decimals:
          award.type === AssetType.ERC20 && decimals !== undefined ? (decimals as number) : 0,
      });
    }
  };

  // clicking the input field will switch the state to input to allow for editing
  const handleSwitchInput = () => setAward({ ...award, state: 'input' });

  const handleAwardAddressChange = (value: string) => {
    setIsTyping(true);
    setAward({ ...award, address: value });
  };

  const handleModalClose = () => {
    // set the award back to awards[0] which is the server data since we're not saving the changes
    setAward(awards[0]);

    setShowSplitAwardModal(false);
  };

  // shows a message about the award (e.g. 3 winners will receive 100 DAI)
  const getAwardMessage = (
    <>
      <TruncateThousands
        amount={editMode ? editedRound!.numWinners! : round.numWinners}
        decimals={2}
      />{' '}
      winner
      {(editMode ? editedRound!.numWinners === 1 : round.numWinners === 1) ? '' : 's'} will receive{' '}
      <TruncateThousands amount={awards[0].amount} decimals={2} />{' '}
      {awards[0].symbol || awards[0].name} ($
      {formatCommaNum(awards[0].price * awards[0].amount)})
      {(editMode ? editedRound!.numWinners === 1 : round.numWinners === 1) ? '' : ' each'}.
    </>
  );

  return (
    <>
      {showSplitAwardModal && (
        <Modal
          modalProps={{
            title: 'Edit award',
            subtitle: '',
            handleClose: handleModalClose,
            body: (
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
            ),
            button: (
              <Button
                text={'Save Changes'}
                bgColor={ButtonColor.Purple}
                onClick={handleAwardsSave}
                disabled={!(award.state === 'success' && award.amount > 0)}
              />
            ),
            setShowModal: setShowSplitAwardModal,
          }}
        />
      )}

      <Group row gap={editMode ? 20 : 45} mb={6}>
        <Group row gap={editMode ? 6 : 16} classNames={classes.fullWidth}>
          <Group gap={4} classNames={classes.inputContainer}>
            <Text type="subtitle">Total awards</Text>

            <div className={classes.award}>
              <div className={classes.awardImgAndAmount}>
                <img src={awards[0].image} alt={awards[0].name} />

                <Group row gap={3}>
                  <span className={classes.awardAmount}>
                    <TruncateThousands amount={awards[0].amount} decimals={2} />
                  </span>
                  <span className={classes.awardName}>{awards[0].symbol || awards[0].name}</span>
                </Group>
              </div>

              {!editMode && <div>${formatCommaNum(awards[0].price * awards[0].amount)}</div>}
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
            winners={editMode ? editedRound!.numWinners! : round.numWinners}
            disabled={false}
            handleNumWinnersChange={handleNumWinnersChange}
          />
        </Group>
      </Group>

      <Text type="body">{getAwardMessage}</Text>
    </>
  );
};

export default SplitAwards;
