import { useEffect, useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import RewardsSimple from '../RewardsSimple';
import RewardsAdvanced from '../RewardsAdvanced';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { InitialRoundProps, checkStepCriteria, updateRound } from '../../../state/slices/round';
import { uuid } from 'uuidv4';

import { isAddress } from 'ethers/lib/utils.js';
import { getTokenInfo } from '../utils/getTokenInfo';
import { changeAward } from '../utils/changeAward';

export interface AwardProps {
  id: string;
  type: 'contract';
  address: string;
  image: string;
  name: string;
  symbol: string;
  state: 'Input' | 'Success' | 'Searching ' | 'Error';
  errorType?: 'AddressNotFound' | 'UnidentifiedContract';
}

const AwardsSelector = () => {
  const [activeSection, setActiveSection] = useState(0);

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    // update round
    dispatch(updateRound({ ...round, [property]: value }));

    // check if step criteria is met
    dispatch(checkStepCriteria());
  };

  const initialAward: AwardProps = {
    id: uuid(),
    type: 'contract',
    address: '',
    image: '',
    name: '',
    symbol: '',
    state: 'Input',
  };

  const [awardContracts, setAwardContracts] = useState<AwardProps[]>(
    round.awards.length ? round.awards : [initialAward],
  );

  const dataToBeCleared = {};

  const clearAwards = () => {
    setAwardContracts([initialAward]);
    dispatch(updateRound({ ...round, numWinners: 0, fundingAmount: 0, awards: [initialAward] }));
    dispatch(checkStepCriteria());
  };

  //TODO: This is a hack to clear the awards when the user goes back to the previous step
  useEffect(() => {
    clearAwards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const [isTyping, setIsTyping] = useState(false);

  // on input change
  const handleInputChange = (award: AwardProps, value: string) => {
    const updated = changeAward(award.id, awardContracts, { ...award, address: value });
    setAwardContracts(updated);
    handleChange('awards', updated);
  };

  // TODO: keep?
  // const handleWinnerChange = (value: number) => {
  // handleChange('numWinners', value);
  // };
  // const handleFundingChange = (value: number) => {
  //   handleChange('fundingAmount', value);
  // };

  const verifiedAwards = (awards: AwardProps[]) => awards.filter(a => a.state === 'Success');

  // TODO: better comments
  // onblur
  const handleOnBlur = async (award: AwardProps) => {
    setIsTyping(false);
    const isEmptyString = award.address === '';
    const isValidAddressString = isAddress(award.address);

    if (isEmptyString) {
      const updated = changeAward(award.id, awardContracts, { ...award, state: 'Input' });
      if (award.state === 'Error') setAwardContracts(updated);

      // if address is empty, don't do anything
      return;
    } else if (!isValidAddressString) {
      // if address isn't even the right format, set state to error
      const updated = changeAward(award.id, awardContracts, {
        ...award,
        state: 'Error',
        errorType: 'AddressNotFound',
      });

      setAwardContracts(updated);
    } else {
      const tokenInfo = await getTokenInfo(award.address);
      const { name, image, symbol } = tokenInfo;
      if (!name || !image || !symbol) {
        const updated = changeAward(award.id, awardContracts, {
          ...award,
          state: 'Error',
          errorType: 'UnidentifiedContract',
        });

        setAwardContracts(updated);
      } else {
        const updated = changeAward(award.id, awardContracts, {
          ...award,
          state: 'Success',
          image: image,
          name: name,
          symbol: symbol,
        });

        // handleChange('numWinners', verifiedAwards(updated).length);

        setAwardContracts(updated);

        dispatch(
          updateRound({
            ...round,
            // update the number of winners if the award is valid (state === 'Success')
            numWinners: verifiedAwards(updated).length,
            currencyType: symbol,
            awards: updated,
          }),
        );
        dispatch(checkStepCriteria());
      }
    }
  };

  // onClear
  const handleClearAward = (award: AwardProps) => {
    const updated = changeAward(award.id, awardContracts, {
      ...award,
      address: '',
      image: '',
      name: '',
      symbol: '',
      state: 'Input',
    });
    setAwardContracts(updated);
    handleChange('awards', updated);
  };

  // change from success to input
  const handleChangeSuccessToInput = (award: AwardProps) => {
    const updated = changeAward(award.id, awardContracts, { ...award, state: 'Input' });
    setAwardContracts(updated);
    // TODO: when Advanced, we need to calculate numWinners based of SUCCESS state awards, meaning, if we change from success to input, we need to subtract 1 from numWinners
    // handleChange('numWinners', verifiedAwards(updated).length);
    // TODO: but cant do it from here because on Simple setup, we track num winners in another input field
    handleChange('awards', updated);
  };

  // remove award
  const handleRemoveAward = (award: AwardProps) => {
    const updated = awardContracts.filter(a => a.id !== award.id);

    setAwardContracts(updated);

    dispatch(
      updateRound({
        ...round,
        numWinners: verifiedAwards(updated).length,
        awards: updated,
      }),
    );

    console.log('removed', round.numWinners);
  };

  // add award
  const handleAddAward = () => {
    const updated = [...awardContracts, initialAward];

    setAwardContracts(updated);

    handleChange('awards', updated);
    dispatch(checkStepCriteria());
  };

  return (
    <>
      <Group>
        <DualSectionSelector dataToBeCleared={dataToBeCleared} setActiveSection={setActiveSection}>
          <Section
            id={0}
            title="Simple: ETH or ERC20s"
            text="Choose the number of winners and the total payment to split between them."
            activeSection={activeSection}
          />
          <Section
            id={1}
            title="Advanced"
            text="Choose a reward individually for each of the winners."
            activeSection={activeSection}
          />
        </DualSectionSelector>
      </Group>

      <Divider />

      {activeSection === 0 &&
        awardContracts.map(award => (
          <RewardsSimple
            key={award.id}
            award={award}
            round={round}
            isTyping={isTyping}
            handleChange={handleChange}
            handleClear={handleClearAward}
            setIsTyping={setIsTyping}
            handleBlur={handleOnBlur}
            handleInputChange={handleInputChange}
            handleInputTypeChange={handleChangeSuccessToInput}
          />
        ))}

      {activeSection === 1 && (
        <RewardsAdvanced
          awards={awardContracts}
          numWinners={round.numWinners}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          handleAdd={handleAddAward}
          handleRemove={handleRemoveAward}
          handleChange={handleChange}
          handleClear={handleClearAward}
          handleBlur={handleOnBlur}
          handleInputChange={handleInputChange}
          handleInputTypeChange={handleChangeSuccessToInput}
        />
      )}
    </>
  );
};

export default AwardsSelector;