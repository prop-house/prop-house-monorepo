import Footer from '../Footer';
import Group from '../Group';
import { useState } from 'react';
import Text from '../Text';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import UploadCSVModal from '../UploadCSVModal';
import { VotingStrategyType, AssetType, VotingStrategyConfig } from '@prophouse/sdk-react';
import VotingStrategyModal from '../VotingStrategyModal';
import VotingStrategies from '../VotingStrategies';

/**
 * @overview
 * Step 3 - user selects the voting strategies (token holders or allowlist users that can vote) for the round
 *
 * @components
 * @name VotingStrategyModal - the modal that allows the user to add a new voting strategy
 * @name UploadCSVModal - // TODO - need to refactor old code to new desgin
 * @name VotingStrategies - list of completed strategies, can be removed but not edited
 *
 * @notes
 * @see NewStrategy - new strategy object
 */

export interface NewStrategy {
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

export const newStrategy: NewStrategy = {
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

const StrategiesConfig = () => {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showVotingStrategyModal, setShowVotingStrategyModal] = useState(false);

  const round = useAppSelector(state => state.round.round);

  // if there are no strategies, set the strategies to an empty array
  const [strategies, setStrategies] = useState<VotingStrategyConfig[]>(
    round.strategies.length ? round.strategies : [],
  );

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

      <Group gap={6} mb={16}>
        <Text type="subtitle">Voting Strategies</Text>
        <Text type="body">
          Voting strategies determine who can vote in your round and how many votes they get.
        </Text>
      </Group>

      {showVotingStrategyModal && (
        <VotingStrategyModal
          strategies={strategies}
          setStrategies={setStrategies}
          setShowVotingStrategyModal={setShowVotingStrategyModal}
        />
      )}

      {showUploadCSVModal && (
        <UploadCSVModal
          handleUpload={() => {}}
          setShowUploadCSVModal={setShowUploadCSVModal}
          type="contract"
        />
      )}

      <VotingStrategies
        strategies={strategies}
        setStrategies={setStrategies}
        setShowVotingStrategyModal={setShowVotingStrategyModal}
      />

      <Footer />
    </>
  );
};

export default StrategiesConfig;
