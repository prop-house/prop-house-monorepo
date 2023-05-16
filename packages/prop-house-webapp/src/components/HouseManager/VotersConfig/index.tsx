import classes from './VotersConfig.module.css';
import Footer from '../Footer';
import Group from '../Group';
import { useState } from 'react';
import Text from '../Text';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import UploadCSVModal, { CSVRow } from '../UploadCSVModal';
import {
  VotingStrategyType,
  AssetType,
  VotingStrategyConfig,
  Whitelist,
} from '@prophouse/sdk-react';
import VotersModal from '../VotersModal';
import Voters from '../Voters';
import { isAddress } from 'ethers/lib/utils.js';
import createUploadMessage from '../utils/createUploadMessage';
import { saveRound } from '../../../state/thunks';

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
  const [uploadMessage, setUploadMessage] = useState('');

  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.round.round);

  // if there are no voters, set the voters to an empty array
  const [voters, setVoters] = useState<VotingStrategyConfig[]>(
    round.voters.length ? round.voters : [],
  );

  const handleCSVUpload = async (data: CSVRow[]) => {
    const invalid: CSVRow[] = []; // Store the invalid addresses
    const duplicates: CSVRow[] = []; // Store the duplicates
    let allowList: Whitelist | undefined;

    // Find existing Whitelist strategy
    const existingStrategyIndex = voters.findIndex(
      existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
    );

    if (existingStrategyIndex > -1) {
      const existingStrategy = voters[existingStrategyIndex];

      // Type guard to ensure existing strategy is a Whitelist strategy
      if ('members' in existingStrategy) {
        allowList = { ...existingStrategy }; // Create a new object
      } else {
        console.error('Invalid strategy type');
      }
    }

    const initialAllowListMembersLength = allowList?.members.length || 0;

    // Loop through the data array
    for (const row of data) {
      if (!isAddress(row.address)) {
        invalid.push(row); // check if address is invalid
      } else if (allowList && allowList.members.find(m => m.address === row.address)) {
        duplicates.push(row); // check if address already exists in the whitelist
      } else {
        // If the address is valid and unique, add it to the voters list
        const newMember = {
          address: row.address,
          votingPower: row.votes.toString(),
        };

        if (allowList) {
          allowList.members = [...allowList.members, newMember]; // Create a new array
        } else {
          allowList = {
            strategyType: VotingStrategyType.WHITELIST,
            members: [newMember],
          };
        }
      }
    }

    // If there are no addresses to add, early return
    if (!allowList || allowList.members.length === initialAllowListMembersLength) {
      setUploadMessage(createUploadMessage(0, duplicates.length, invalid.length));
      setShowUploadCSVModal(false);
      return;
    }

    // Add or update the Whitelist strategy in the voters list
    const updatedVoters =
      existingStrategyIndex > -1
        ? [
            ...voters.slice(0, existingStrategyIndex),
            allowList,
            ...voters.slice(existingStrategyIndex + 1),
          ]
        : [...voters, allowList];

    // Save and set the updated voters list
    dispatch(saveRound({ ...round, voters: updatedVoters }));
    setVoters(updatedVoters);

    // Set the upload message
    setUploadMessage(
      createUploadMessage(
        allowList.members.length - initialAllowListMembersLength,
        duplicates.length,
        invalid.length,
      ),
    );
    setShowUploadCSVModal(false);

    return { csvVoters: allowList };
  };

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
          handleUpload={handleCSVUpload}
          setShowUploadCSVModal={setShowUploadCSVModal}
        />
      )}

      {uploadMessage !== '' && (
        <Group mb={12}>
          <Text type="subtitle" classNames={classes.message}>
            {uploadMessage}
          </Text>
        </Group>
      )}

      <Voters
        voters={voters}
        setVoters={setVoters}
        setUploadMessage={setUploadMessage}
        setShowVotersModal={setShowVotersModal}
        setShowUploadCSVModal={setShowUploadCSVModal}
      />

      <Footer />
    </>
  );
};

export default VotersConfig;
