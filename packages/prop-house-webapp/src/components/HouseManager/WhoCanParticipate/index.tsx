import Footer from '../Footer';
import Group from '../Group';
import { useState } from 'react';
import Text from '../Text';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import UploadCSVModal from '../UploadCSVModal';
import { VotingStrategyType, AssetType, VotingStrategyConfig } from '@prophouse/sdk/dist/types';
import VotingStrategyModal from '../VotingStrategyModal';
import VotingStrategies from '../VotingStrategies';

export enum StrategyType {
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155',
  ERC20 = 'ERC-20',
  Allowlist = 'Allowlist',
}
export enum AwardType {
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155',
  ERC20 = 'ERC-20',
}
export enum ERC20 {
  ETH = 'ETH',
  WETH = 'WETH',
  USDC = 'USDC',
  APE = 'APE',
  OTHER = 'Other',
}

export interface NewStrategy {
  type: VotingStrategyType;
  address: string;
  asset: AssetType;
  multiplier: number;
  tokenId: string;
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

const WhoCanParticipate = () => {
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showVotingStrategyModal, setShowVotingStrategyModal] = useState(false);

  const round = useAppSelector(state => state.round.round);
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
          // handleUpload={handleCSVUpload}
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

export default WhoCanParticipate;
