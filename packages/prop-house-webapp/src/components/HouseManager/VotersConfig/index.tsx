import Footer from '../Footer';
import Group from '../Group';
import { useState } from 'react';
import Text from '../Text';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import UploadCSVModal from '../UploadCSVModal';
import { VotingStrategyType, AssetType, VotingStrategyConfig } from '@prophouse/sdk-react';
import VotersModal from '../VotersModal';
import Voters from '../Voters';

/**
 * @overview
 * Step 3 - user selects the voters (token holders or allowlist users that can vote) for the round
 *
 * @components
 * @name VotingStrategyModal - the modal that allows the user to add a new voting strategy
 * @name UploadCSVModal - // TODO - need to refactor old code to new desgin
 * @name Voters - list of completed voters, can be removed but not edited
 *
 * @notes
 * @see NewVoter - new strategy object
 */

export interface NewVoter {
  type: VotingStrategyType;
  address: string;
  asset: AssetType;
  multiplier: number;
  tokenId: string;
  // state is used to track the state of the input
  state: 'input' | 'success' | 'error';
  name: string;
  image: string;
  error: string;
}

export const newVoter: NewVoter = {
  type: VotingStrategyType.BALANCE_OF,
  asset: AssetType.ERC721,
  address: '',
  multiplier: 1,
  tokenId: '1',
  state: 'input',
  name: '',
  image: '',
  error: '',
};

const VotersConfig = () => {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showVotersModal, setShowVotersModal] = useState(false);

  const round = useAppSelector(state => state.round.round);

  // if there are no voters, set the voters to an empty array
  const [voters, setVoters] = useState<VotingStrategyConfig[]>(
    round.voters.length ? round.voters : [],
  );

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider />

      <Group gap={6} mb={16}>
        <Text type="subtitle">Voters</Text>
        <Text type="body">Determine who can vote in your round and how many votes they get.</Text>
      </Group>

      {showVotersModal && (
        <VotersModal
          voters={voters}
          setVoters={setVoters}
          setShowVotersModal={setShowVotersModal}
        />
      )}

      {showUploadCSVModal && (
        <UploadCSVModal
          handleUpload={() => {}}
          setShowUploadCSVModal={setShowUploadCSVModal}
          type="contract"
        />
      )}

      <Voters voters={voters} setVoters={setVoters} setShowVotersModal={setShowVotersModal} />

      <Footer />
    </>
  );
};

export default VotersConfig;
