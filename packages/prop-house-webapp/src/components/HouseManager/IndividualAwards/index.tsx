import classes from './IndividualAwards.module.css';
import Text from '../Text';
import Group from '../Group';
import { checkStepCriteria, NewRound, updateRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { AssetType } from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import { Award, NewAward } from '../AssetSelector';
import { SetStateAction, useState } from 'react';
import Modal from '../../Modal';
import { useAppSelector } from '../../../hooks';
import { getERC20Image } from '../utils/getERC20Image';
import { AwardType, ERC20 } from '../StrategiesConfig';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';
import { getUSDPrice } from '../utils/getUSDPrice';
import AwardWithPlace from '../AwardWithPlace';
import AddAward from '../AddAward';
import getNumberWithOrdinal from '../../../utils/getNumberWithOrdinal';
import AwardRow from '../AwardRow';
import { useProvider } from 'wagmi';
import { getTokenIdImage } from '../utils/getTokenIdImage';

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

const IndividualAwards: React.FC<{
  editMode?: boolean;
  awards: Award[];
  setAwards: React.Dispatch<SetStateAction<Award[]>>;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, awards, setAwards, editedRound, setEditedRound } = props;

  const [showIndividualAwardModal, setShowIndividualAwardModal] = useState(false);

  const [award, setAward] = useState({ ...NewAward, type: AssetType.ERC20 });
  const [selectedAward, setSelectedAward] = useState<string>(AwardType.ERC20);

  const provider = useProvider();
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleSelectAward = async (token: ERC20) => {
    let updated: Partial<Award>;
    let type = token === ERC20.ETH ? AssetType.ETH : AssetType.ERC20;

    const { price } = await getUSDPrice(type, erc20TokenAddresses[token], provider);

    // when selecting a new asset, reset the state
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
    setAward({ ...award, ...updated });
  };

  const handleSaveAward = async () => {
    let image_url = null;

    if (award.type === AssetType.ERC721 || award.type === AssetType.ERC1155) {
      try {
        const { image } = await getTokenIdImage(award.address, award.tokenId!, provider);
        image_url = image;
      } catch (error) {
        console.error('Error fetching image', error);
      }
    }

    let updated: Partial<Award>;

    updated = {
      address:
        award.selectedAsset === null ? award.address : erc20TokenAddresses[award.selectedAsset],
      amount: award.amount,
      id: award.id,
      image:
        award.selectedAsset === null
          ? award.type === AssetType.ERC721 || award.type === AssetType.ERC1155
            ? image_url
            : award.image
          : getERC20Image(award.selectedAsset!),
      name: award.name,
      price: award.price,
      selectedAsset: award.selectedAsset,
      state: 'success',
      symbol: award.symbol,
      tokenId: award.tokenId,
      type: award.type,
    };

    const updatedAwards = awards.map(a => {
      if (a.id === award.id) {
        return { ...a, ...updated };
      } else {
        return a;
      }
    });

    if (editMode) {
      const filteredAwards = updatedAwards.filter(award => award.state === 'success');
      setEditedRound!({
        ...editedRound!,
        numWinners: filteredAwards.length,
        awards: filteredAwards,
      });
    } else {
      setAwards(updatedAwards);
      dispatch(
        updateRound({
          ...round,
          numWinners: updatedAwards.length,
          awards: updatedAwards,
        }),
      );
      dispatch(checkStepCriteria());
    }

    setSelectedAward(AwardType.ERC20);
    setAwardIdx(0);
    setShowIndividualAwardModal(false);
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(award.address);

  const [isTyping, setIsTyping] = useState(false);

  const handleERC20AddressBlur = async () => {
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
      const { name, image, symbol } = await getTokenInfo(award.address, provider);
      const { price } = await getUSDPrice(award.type, award.address, provider);
      setAward({ ...award, state: 'success', name, image, symbol, price });
    }
  };

  const handleSwitchInput = () => setAward({ ...award, state: 'input' });

  const handleAddressChange = (value: string) => {
    setIsTyping(true);
    setAward({ ...award, address: value });
  };

  const handleModalClose = () => {
    setAwardIdx(0);

    setSelectedAward(AwardType.ERC20);
    setShowIndividualAwardModal(false);
  };

  const addNewAward = () => {
    const updatedAwards = [...awards, NewAward];

    if (editMode) {
      setEditedRound!({
        ...editedRound!,
        splitAwards: false,
        numWinners: updatedAwards.length,
        awards: updatedAwards,
      });
    } else {
      setAwards(updatedAwards);
    }
  };

  const removeAward = (id: string) => {
    let updated: Award[] = awards.filter(award => award.id !== id);

    if (editMode) {
      const filteredAwards = updated.filter(award => award.state === 'success');

      setEditedRound!({
        ...editedRound!,
        splitAwards: false,
        numWinners: filteredAwards.length,
        awards: filteredAwards,
      });
    } else {
      dispatch(updateRound({ ...round, numWinners: updated.length, awards: updated }));
      dispatch(checkStepCriteria());
      setAwards(updated);
    }
  };

  const isDisabled = () => {
    if (award.state !== 'success') {
      return true;
    }

    if (award.type === AssetType.ERC20) {
      return award.amount <= 0 || award.selectedAsset === null;
    } else if (award.type === AssetType.ERC1155 || award.type === AssetType.ERC721) {
      return award.tokenId === '';
    }
  };

  const [awardIdx, setAwardIdx] = useState(0);

  const handleTokenBlur = async (id: string) => {
    if (award.tokenId === '') return;

    const { image } = await getTokenIdImage(award.address, id, provider);

    const isDuplicate = awards.some(
      a => a.address === award.address && a.tokenId === award.tokenId,
    );

    if (isDuplicate) {
      setAward({
        ...award,
        state: 'error',
        error: `An award with ${award.name} #${award.tokenId} already exists`,
      });
      return;
    } else {
      setAward({ ...award, error: '', image });
      return;
    }
  };

  return (
    <>
      {showIndividualAwardModal && (
        <Modal
          title={
            award.state === 'success' ? `Edit ${getNumberWithOrdinal(awardIdx)} place` : 'Add award'
          }
          subtitle=""
          onRequestClose={handleModalClose}
          body={
            <>
              <AddAward
                isTyping={isTyping}
                setIsTyping={setIsTyping}
                award={award}
                selectedAward={selectedAward}
                setAward={setAward}
                setSelectedAward={setSelectedAward}
                handleAddressChange={handleAddressChange}
                handleTokenBlur={handleTokenBlur}
                handleSelectAward={handleSelectAward}
                handleSwitchInput={handleSwitchInput}
                handleERC20AddressBlur={handleERC20AddressBlur}
              />
            </>
          }
          button={<Button text={'Cancel'} bgColor={ButtonColor.White} onClick={handleModalClose} />}
          secondButton={
            <Button
              text={'Save Changes'}
              bgColor={ButtonColor.Purple}
              onClick={handleSaveAward}
              disabled={isDisabled()}
            />
          }
          setShowModal={setShowIndividualAwardModal}
        />
      )}

      <Group gap={16}>
        {awards.map((award, idx) => {
          const isSaved = editMode
            ? awards.some(
                savedAward => savedAward.id === award.id && savedAward.state === 'success',
              )
            : round.awards.some(
                savedAward => savedAward.id === award.id && savedAward.state === 'success',
              );

          return (
            <Group key={award.id} gap={8}>
              <AwardWithPlace place={idx + 1} />
              <Group row gap={8}>
                {isSaved ? (
                  <>
                    <AwardRow award={award} />
                    <Button
                      text="Edit"
                      classNames={classes.awardBtn}
                      bgColor={ButtonColor.White}
                      onClick={() => {
                        setAwardIdx(idx + 1);
                        setShowIndividualAwardModal(true);
                        setAward(awards[idx]);
                      }}
                    />
                  </>
                ) : (
                  <Button
                    text="Add award"
                    bgColor={ButtonColor.White}
                    classNames={classes.awardBtn}
                    onClick={() => {
                      setShowIndividualAwardModal(true);
                      setAward(awards[idx]);
                    }}
                  />
                )}
                {idx !== 0 && (
                  <Button
                    text="Remove"
                    bgColor={ButtonColor.White}
                    onClick={() => removeAward(award.id)}
                  />
                )}
              </Group>
            </Group>
          );
        })}
        <Text type="link" onClick={addNewAward}>
          Add more awards
        </Text>
      </Group>
    </>
  );
};

export default IndividualAwards;
