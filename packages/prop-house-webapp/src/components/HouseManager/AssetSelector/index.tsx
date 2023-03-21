import { FC, useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import { useAppSelector } from '../../../hooks';
import { AssetType } from '@prophouse/sdk';
import SplitAwards from '../SplitAwards';
import { ERC20 } from '../WhoCanParticipate';

export interface Award {
  type: AssetType;
  address: string;
  image: string;
  name: string;
  symbol: string;
  amount: number;
  selectedAsset: ERC20;
  price: number;
  state: 'input' | 'success' | 'error';
  error?: string;
}

export const newAward: Award = {
  type: AssetType.ETH,
  address: '',
  image: '/manager/eth.png',
  name: 'ETH',
  symbol: 'ETH',
  selectedAsset: ERC20.ETH,
  amount: 1,
  state: 'input',
  price: 0,
  error: '',
};

const AssetSelector: FC<{
  editMode?: boolean;
  winnerCount?: number;
  setWinnerCount?: React.Dispatch<React.SetStateAction<number>>;
}> = props => {
  const { editMode, winnerCount, setWinnerCount } = props;

  const [activeSection, setActiveSection] = useState(0);
  const isSplitAward = activeSection === 0;
  // const isAdvancedAward = activeSection === 1;

  const round = useAppSelector(state => state.round.round);

  const [awards, setAwards] = useState<Award[]>(round.awards.length ? [...round.awards] : []);

  const dataToBeCleared = {};

  // const clearAwards = () => {
  //   setAwardContracts([initialAward]);
  //   dispatch(updateRound({ ...round, numWinners: 0, awards: [initialAward] }));
  //   // TODO: still need this here idk why
  //   dispatch(checkStepCriteria());
  // };

  // //TODO: This is a hack to clear the awards when the user goes back to the previous step
  // useEffect(() => {
  //   clearAwards();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeSection]);

  return (
    <>
      <Group>
        <DualSectionSelector dataToBeCleared={dataToBeCleared} setActiveSection={setActiveSection}>
          <Section
            id={0}
            title="Split Awards"
            text="Choose the number of winners and the total payment to split between them."
            activeSection={activeSection}
          />
          <Section
            id={1}
            title="Inidividual Awards"
            text="Choose a reward individually for each of the winners."
            activeSection={activeSection}
          />
        </DualSectionSelector>
      </Group>

      <Divider />

      {isSplitAward && (
        <SplitAwards
          editMode={editMode}
          awards={awards}
          setAwards={setAwards}
          winnerCount={winnerCount}
          setWinnerCount={setWinnerCount}
        />
      )}
    </>
  );
};

export default AssetSelector;
