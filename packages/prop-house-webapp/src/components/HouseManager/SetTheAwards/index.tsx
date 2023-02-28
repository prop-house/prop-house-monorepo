import { useEffect, useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import Section from '../Section';
import RewardsSimple from '../RewardsSimple';
// import RewardsAdvanced from '../RewardsAdvanced';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { InitialRoundProps, setDisabled, updateRound } from '../../../state/slices/round';
import Text from '../Text';
import { uuid } from 'uuidv4';

import { isAddress } from 'ethers/lib/utils.js';
import { getTokenInfo } from '../utils/getTokenInfo';

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

// TODO: add to utils folder
export const changeAward = (id: string, addresses: AwardProps[], changes: Partial<AwardProps>) =>
  addresses.map(address => (address.id === id ? { ...address, ...changes } : address));

const SetTheAwards = () => {
  const [activeSection, setActiveSection] = useState(0);

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    const newRound = { ...round, [property]: value };
    dispatch(updateRound(newRound));

    // Dispatch the setDisabled action with the validation check for step 3
    const isStepCompleted =
      round.awards.some(c => c.state === 'Success') &&
      round.numWinners !== 0 &&
      round.fundingAmount !== 0;

    dispatch(setDisabled(!isStepCompleted));
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
    dispatch(setDisabled(true));
  };

  //TODO: This is a hack to clear the awards when the user goes back to the previous step
  useEffect(() => {
    if (activeSection === 0) {
    } else {
      clearAwards();
    }
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
  //   handleChange('numWinners', value);
  // };
  // const handleFundingChange = (value: number) => {
  //   handleChange('fundingAmount', value);
  // };

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
        dispatch(updateRound({ ...round, currencyType: symbol, awards: updated }));
        setAwardContracts(updated);
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
    handleChange('awards', updated);
  };

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

      <Header
        title="What will the winners be awarded?"
        subtitle="Specify the awards paid out for the winning props. Any ties will go to the prop created first."
      />

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
            handleChange={handleChange}
            round={round}
            // TODO: keep?
            handleClear={handleClearAward}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            handleBlur={handleOnBlur}
            handleInputChange={handleInputChange}
            handleInputTypeChange={handleChangeSuccessToInput}
          />
        ))}

      {/* {activeSection === 1 && (
        <div>Advanced</div>
        // <RewardsAdvanced
        //   awardContracts={awardContracts}
        //   handleChange={handleChange}
        //   numOfAwards={round.numWinners}
        // />
      )} */}

      <Footer />
    </>
  );
};

export default SetTheAwards;
