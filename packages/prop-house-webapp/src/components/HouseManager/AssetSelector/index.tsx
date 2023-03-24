import { FC, useState } from 'react';
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

  const [isSplitAward, setIsSplitAward] = useState(round.splitAwards);

  const changeAwardType = () => {
    setIsSplitAward(!isSplitAward);
    const updated = { ...round, splitAwards: !isSplitAward, numWinners: 1, awards: [] };

    if (isSplitAward) {
      setIndividualAwards(initialIndividualAwards);
    } else {
      setSplitAwards([NewAward]);
    }
    if (!editMode) {
      dispatch(updateRound(updated));
      dispatch(checkStepCriteria());
    }
  };

  return (
    <>
      <Group>
        <DualSectionSelector onChange={changeAwardType}>
          <Section
            active={isSplitAward}
            title="Split Awards"
            text="Choose the number of winners and the total payment to split between them."
          />
          <Section
            active={!isSplitAward}
            title="Inidividual Awards"
            text="Choose a reward individually for each of the winners."
          />
        </DualSectionSelector>
      </Group>

      <Divider />

      {isSplitAward ? (
        <SplitAwards
          editMode={editMode}
          awards={splitAwards}
          setAwards={setSplitAwards}
          winnerCount={winnerCount}
          setWinnerCount={setWinnerCount}
        />
      ) : (
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
