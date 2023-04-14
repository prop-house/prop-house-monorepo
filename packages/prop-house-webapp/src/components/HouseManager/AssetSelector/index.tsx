import { FC, useState } from 'react';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import { useAppSelector } from '../../../hooks';
import { AssetType } from '@prophouse/sdk-react';
import { ERC20 } from '../AwardsConfig';
import SplitAwards from '../SplitAwards';
import IndividualAwards from '../IndividualAwards';
import { v4 as uuidv4 } from 'uuid';
import { NewRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { saveRound } from '../../../state/thunks';

/**
 * @function changeAwardType - changes the award type to split or individual, and resets the awards
 *
 * @components
 * @name DualSectionSelector - the wrapper for the two sections, handles changing the award type
 * @name Section - the two sections, split and individual
 * @name SplitAwards - the split awards section
 * @name IndividualAwards - the individual awards section
 *
 * @notes
 * @see NewAward - the base award object
 * @see erc20TokenAddresses - addresses for the predefined ERC20 tokens
 * @see erc20Name - names for the predefined ERC20 tokens
 * @see editMode - used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

export interface Award {
  id: string;
  type: AssetType;
  address: string;
  tokenId?: string;
  image: string;
  name: string;
  symbol: string;
  amount: number;
  decimals: number;
  selectedAsset: ERC20 | null;
  price: number;
  state: 'input' | 'success' | 'error' | 'dummy';
  error?: string;
}

export const NewAward: Award = {
  id: uuidv4(),
  type: AssetType.ETH,
  address: '',
  tokenId: '',
  image: '/manager/eth.png',
  name: 'ETH',
  symbol: 'ETH',
  selectedAsset: null,
  amount: 1,
  decimals: 18,
  state: 'input',
  price: 0,
  error: '',
};

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

const AssetSelector: FC<{
  editMode?: boolean;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, editedRound, setEditedRound } = props;

  const round = useAppSelector(state => state.round.round);
  const dispatch = useDispatch();

  // Set the individual awards to 3 dummy awards if no awards set
  const initialIndividualAwards: Award[] = [
    { ...NewAward, id: uuidv4(), state: 'dummy' },
    { ...NewAward, id: uuidv4(), state: 'dummy' },
    { ...NewAward, id: uuidv4(), state: 'dummy' },
  ];

  // should always have a split award since we set it on base NewRound
  const [splitAwards, setSplitAwards] = useState<Award[]>(
    round.awards.length ? [...round.awards] : [],
  );

  const [individualAwards, setIndividualAwards] = useState<Award[]>(
    round.awards[0] && round.awards[0].id !== NewAward.id ? round.awards : initialIndividualAwards,
  );

  const [isSplitAward, setIsSplitAward] = useState(round.splitAwards);

  const changeAwardType = () => {
    if (editMode && editedRound) {
      // If we are editing and changing from split awards to individual awards and had multiple winners, we
      // need to create a new array of awards based on the number of winners and all awards will be the same
      const newAwards = Array.from({ length: editedRound.numWinners }, () => ({
        ...editedRound.awards[0],
        id: uuidv4(),
      }));

      // If we are editing and changing from individual to split awards, that means we'll have existing awards
      // so we need to find an existing ETH or ERC20 award in the awards array and set the split award to that
      const baseAward = editedRound.awards.find(
        award => award.type === AssetType.ETH || award.type === AssetType.ERC20,
      );

      setEditedRound!({
        ...editedRound,
        splitAwards: !editedRound.splitAwards,
        // set the awards based on which type we are changing to
        awards: editedRound.splitAwards ? newAwards : [baseAward || NewAward],
      });
    } else {
      // If we are not editing we reset the awards back to each type's default
      const updated = { ...round, splitAwards: !isSplitAward, numWinners: 1, awards: [] };

      if (isSplitAward) {
        setIndividualAwards(initialIndividualAwards);
      } else {
        setSplitAwards([NewAward]);
      }

      dispatch(saveRound(updated));
    }

    // Toggle the isSplitAward state at the end of the function
    setIsSplitAward(!isSplitAward);
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
          awards={editMode ? editedRound!.awards : splitAwards}
          setAwards={setSplitAwards}
          editedRound={editedRound}
          setEditedRound={setEditedRound}
        />
      ) : (
        <IndividualAwards
          editMode={editMode}
          awards={editMode ? editedRound!.awards : individualAwards}
          setAwards={setIndividualAwards}
          setEditedRound={setEditedRound}
          editedRound={editedRound}
        />
      )}
    </>
  );
};

export default AssetSelector;
