import { FC, useState } from 'react';
import { useAppSelector } from '../../../hooks';
import { AssetType } from '@prophouse/sdk-react';
import IndividualAwards from '../IndividualAwards';
import { v4 as uuidv4 } from 'uuid';
import { NewRound } from '../../../state/slices/round';

interface EditableAssetMetadata {
  id: string;
  state: 'dummy' | 'editing' | 'valid' | 'saved' | 'error' | 'input';
  error?: string;
  allocated: number;
}
type AssetProps = {
  assetType: AssetType;
  address: string;
  tokenId: string;
  amount: string;
};

export type EditableAsset = EditableAssetMetadata & AssetProps;

export const newAward: EditableAsset = {
  id: uuidv4(),
  state: 'dummy',
  error: '',
  allocated: 0,
  assetType: AssetType.ETH,
  amount: '0',
  tokenId: '',
  address: '',
};

export enum DefaultERC20s {
  USDC = 'USDC',
  OTHER = 'Other',
}

export const erc20TokenAddresses: { [key in DefaultERC20s]: string } = {
  [DefaultERC20s.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [DefaultERC20s.OTHER]: '',
};

export const erc20img = (tokenAddress: string) => {
  switch (tokenAddress) {
    case '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48':
      return '/manager/usdc.svg';
    default:
      return '/manager/token.svg';
  }
};

const AssetSelector: FC<{
  editMode?: boolean;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, editedRound, setEditedRound } = props;

  const round = useAppSelector(state => state.round.round);

  // Set the individual awards to 3 dummy awards if no awards set
  const initialIndividualAwards: EditableAsset[] = [
    { ...newAward, id: uuidv4(), state: 'dummy' },
    { ...newAward, id: uuidv4(), state: 'dummy' },
    { ...newAward, id: uuidv4(), state: 'dummy' },
  ];

  const [individualAwards, setIndividualAwards] = useState<EditableAsset[]>(
    round.awards[0] && round.awards[0].id !== newAward.id ? round.awards : initialIndividualAwards,
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
