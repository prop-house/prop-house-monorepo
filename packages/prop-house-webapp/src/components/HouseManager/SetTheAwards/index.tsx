import { useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import RoundName from '../RoundName';
import Section from '../Section';
import RewardsSimple from '../RewardsSimple';
import RewardsAdvanced from '../RewardsAdvanced';

const numOfAwards = 4;

const SetTheAwards = () => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <>
      <RoundName name="Nouns Video Contest Marketing Team" />

      <Header
        title="What will the winners be awarded?"
        subtitle="Specify the awards paid out for the winning props. Any ties will go to the prop created first."
      />

      <Group>
        <DualSectionSelector setActiveSection={setActiveSection}>
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
