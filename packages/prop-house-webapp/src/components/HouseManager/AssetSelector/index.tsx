import { FC, useState } from 'react';
import { useAppSelector } from '../../../hooks';
import { AssetType } from '@prophouse/sdk-react';
import IndividualAwards from '../IndividualAwards';
import { v4 as uuidv4 } from 'uuid';
import { NewRound } from '../../../state/slices/round';

/**
 * @function changeAwardType - changes the award type to split or individual, and resets the awards
 *
 * @component
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
  state: 'dummy' | 'editing' | 'valid' | 'saved' | 'error' | 'input';
  error?: string;
  allocated: number;
}

export const NewAward: Award = {
  id: uuidv4(),
  type: AssetType.ETH,
  address: '',
  tokenId: '',
  image: '/manager/eth.png',
  name: 'ETH',
  symbol: 'ETH',
  amount: 0,
  decimals: 18,
  state: 'dummy',
  error: '',
  allocated: 0,
};

export enum DefaultERC20s {
  USDC = 'USDC',
  APE = 'APE',
  OTHER = 'Other',
}

export const erc20TokenAddresses: { [key in DefaultERC20s]: string } = {
  [DefaultERC20s.USDC]: '0x0d6B12630Db150559822bb5297227C107332A8bf',
  [DefaultERC20s.APE]: '0x5242CD84b432969FeEF70E0dFa5725418dA38c20',
  [DefaultERC20s.OTHER]: '',
};

export const erc20Name: { [key in DefaultERC20s]: string } = {
  [DefaultERC20s.USDC]: 'USD Coin',
  [DefaultERC20s.APE]: 'Ape Coin',
  [DefaultERC20s.OTHER]: '',
};

const AssetSelector: FC<{
  editMode?: boolean;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, editedRound, setEditedRound } = props;

  const round = useAppSelector(state => state.round.round);

  // Set the individual awards to 3 dummy awards if no awards set
  const initialIndividualAwards: Award[] = [
    { ...NewAward, id: uuidv4(), state: 'dummy' },
    { ...NewAward, id: uuidv4(), state: 'dummy' },
    { ...NewAward, id: uuidv4(), state: 'dummy' },
  ];

  const [individualAwards, setIndividualAwards] = useState<Award[]>(
    round.awards[0] && round.awards[0].id !== NewAward.id ? round.awards : initialIndividualAwards,
  );

  return (
    <IndividualAwards
      editMode={editMode}
      awards={editMode ? editedRound!.awards : individualAwards}
      setAwards={setIndividualAwards}
      setEditedRound={setEditedRound}
      editedRound={editedRound}
    />
  );
};

export default AssetSelector;
