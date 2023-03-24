import { FC, useEffect, useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import { useAppSelector } from '../../../hooks';
import { AssetType } from '@prophouse/sdk';
import SplitAwards from '../SplitAwards';
import { ERC20 } from '../WhoCanParticipate';
import IndividualAwards from '../IndividualAwards';
import { uuid } from 'uuidv4';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';

export interface Award {
  id: string;
  type: AssetType;
  address: string;
  tokenId?: string;
  image: string;
  name: string;
  symbol: string;
  amount: number;
  selectedAsset: ERC20 | null;
  price: number;
  state: 'input' | 'success' | 'error' | 'dummy';
  error?: string;
}

export const NewAward: Award = {
  id: uuid(),
  type: AssetType.ETH,
  address: '',
  tokenId: '',
  image: '/manager/eth.png',
  name: 'ETH',
  symbol: 'ETH',
  selectedAsset: null,
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
  const isIndividualAward = activeSection === 1;

  const round = useAppSelector(state => state.round.round);
  const dispatch = useDispatch();

  const initialIndividualAwards: Award[] = [
    { ...NewAward, id: uuid(), state: 'dummy' },
    { ...NewAward, id: uuid(), state: 'dummy' },
    { ...NewAward, id: uuid(), state: 'dummy' },
  ];

  const [splitAwards, setSplitAwards] = useState<Award[]>(
    round.awards.length ? [...round.awards] : [],
  );
  const [individualAwards, setIndividualAwards] = useState<Award[]>(
    round.awards[0] && round.awards[0].id !== NewAward.id ? round.awards : initialIndividualAwards,
  );

  const dataToBeCleared = {};

  useEffect(() => {
    // reset each award config when switching between types
    dispatch(updateRound({ ...round, numWinners: 1, awards: [] }));
    if (activeSection === 0) setIndividualAwards(initialIndividualAwards);
    if (activeSection === 1) setSplitAwards([NewAward]);
    dispatch(checkStepCriteria());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

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
          awards={splitAwards}
          setAwards={setSplitAwards}
          winnerCount={winnerCount}
          setWinnerCount={setWinnerCount}
        />
      )}

      {isIndividualAward && (
        <IndividualAwards
          editMode={editMode}
          awards={individualAwards}
          setAwards={setIndividualAwards}
          winnerCount={winnerCount}
          setWinnerCount={setWinnerCount}
        />
      )}
    </>
  );
};

export default AssetSelector;
