import { useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import Section from '../Section';
import RewardsSimple from '../RewardsSimple';
import RewardsAdvanced from '../RewardsAdvanced';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { InitialRoundProps, setDisabled, updateRound } from '../../../state/slices/round';
import Text from '../Text';

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
    const isStepCompleted = round.numWinners !== 0 && round.fundingAmount !== 0;
    dispatch(setDisabled(!isStepCompleted));
  };

  // const [rewards, setRewards] = useState([]);

  const dataToBeCleared = {
    numWinners: 0,
    fundingAmount: 0,
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

      {activeSection === 0 && <RewardsSimple />}
      {activeSection === 1 && <RewardsAdvanced numOfAwards={numOfAwards} />}

      <Footer />
    </>
  );
};

export default SetTheAwards;
