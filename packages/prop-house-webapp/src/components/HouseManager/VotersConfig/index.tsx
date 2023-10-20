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
  GovPowerStrategyConfig,
  AllowlistConfig,
  DefaultGovPowerConfigs,
} from '@prophouse/sdk-react';
import VotersModal from '../VotersModal';
import { isAddress } from 'ethers/lib/utils.js';
import createUploadMessage from '../utils/createUploadMessage';
import { saveRound } from '../../../state/thunks';
import Button, { ButtonColor } from '../../Button';
import OverflowScroll from '../OverflowScroll';
import Voter from '../Voter';

/**
 * @overview
 * Step 3 - user selects the voters (token holders or allowlist users that can vote) for the round
 *
 * @components
 * @name VotingStrategyModal - the modal that allows the user to add a new voting strategy
 * @name UploadCSVModal - the modal that allows the user to upload a CSV of voters
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
  const [displayCount, setDisplayCount] = useState(10);

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

    // Reset the display count
    setDisplayCount(10);

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

  const handleRemoveVoter = (address: string, type: string) => {
    if (type === VotingStrategyType.VANILLA) return;

    let updatedVoters: DefaultVotingConfigs[] = [...voters];

    if (type === VotingStrategyType.WHITELIST) {
      // Find existing Whitelist strategy
      const existingStrategyIndex = voters.findIndex(
        existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
      );

      if (existingStrategyIndex > -1) {
        const existingStrategy = voters[existingStrategyIndex];

        // Type guard to ensure existing strategy is a Whitelist strategy
        if ('members' in existingStrategy) {
          // if there's only one member left, remove the entire "Voter" by returning an empty array
          if (existingStrategy.members.length === 1) {
            updatedVoters = [
              ...voters.slice(0, existingStrategyIndex),
              ...voters.slice(existingStrategyIndex + 1),
            ];
          } else {
            // otherwise, remove the member from the "Voter"
            const updatedStrategy = {
              ...existingStrategy,
              members: existingStrategy.members.filter(m => m.address !== address),
            };
            updatedVoters = [
              ...voters.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...voters.slice(existingStrategyIndex + 1),
            ];
          }
        } else {
          console.log('Invalid strategy type');
        }
      } else {
        console.log('No whitelist strategy found');
      }
    } else {
      updatedVoters = voters.filter(s => {
        // we do this because the Whitelist type doesn't have an address field
        // this ensures that we don't remove the wrong "Voter"
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    setVoters(updatedVoters);

    dispatch(saveRound({ ...round, voters: updatedVoters }));

    // After the voter is removed, check if all visible voters have been removed
    let visibleCount = 0;

    updatedVoters.forEach(voter => {
      if (voter.strategyType === VotingStrategyType.WHITELIST && voter.members) {
        visibleCount += Math.min(voter.members.length, displayCount!);
      } else {
        visibleCount += 1;
      }
    });

    // If all visible voters have been removed, increase the displayCount to show the next 10 (or as many as there are remaining)
    if (visibleCount === 0) setDisplayCount!(Math.min(getVoterCount(), displayCount! + 10));
  };

  // this is used to determine whether or not we should show the "View X more voter(s)" link
  const getVoterCount = () => {
    return voters.reduce((count, voter) => {
      if (voter.strategyType === VotingStrategyType.WHITELIST && 'members' in voter) {
        // Add the number of members to the count
        return count + voter.members.length;
      } else {
        // If voter is not a whitelist strategy, add 1 to the count
        return count + 1;
      }
    }, 0);
  };

  const handleShowMoreVoters = () => setDisplayCount!(getVoterCount());

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

      <OverflowScroll>
        <Group gap={12} mb={12} classNames={classes.voters}>
          {voters.slice(0, displayCount).map((s, idx) =>
            // not supported
            s.strategyType === VotingStrategyType.VANILLA ? (
              <></>
            ) : // if it's a whitelist, we need to map over the members
            s.strategyType === VotingStrategyType.WHITELIST ? (
              s.members.slice(0, displayCount).map((m, idx) => (
                <Voter
                  key={idx}
                  type={s.strategyType}
                  address={m.address}
                  multiplier={Number(m.votingPower)}
                  removeVoter={handleRemoveVoter}
                  // if there's 1 voter, we don't want to allow them to remove it
                  isDisabled={s.members.length === 1}
                />
              ))
            ) : (
              // otherwise, proceed as normal
              <Voter
                key={idx}
                type={s.strategyType}
                address={s.address}
                multiplier={s.multiplier}
                removeVoter={handleRemoveVoter}
                // if there's 1 voter, we don't want to allow them to remove it
                isDisabled={voters.length === 1}
              />
            ),
          )}
        </Group>
      </OverflowScroll>

      {/* This will only show if there are more than 10 voters and the display count is less than the total number of voters */}
      {getVoterCount() > 10 && displayCount !== getVoterCount() && (
        <Group mb={12}>
          <Text type="link" onClick={handleShowMoreVoters} classNames={classes.message}>
            {`Show ${getVoterCount() - displayCount!} more ${
              getVoterCount() - displayCount! === 1 ? 'voter' : 'voters'
            }`}
          </Text>
        </Group>
      )}

      <Group row gap={6} mb={18}>
        <Button
          text={'Add a voter'}
          bgColor={ButtonColor.Pink}
          onClick={() => setShowVotersModal!(true)}
        />

        <Button
          text={'Upload CSV'}
          bgColor={ButtonColor.White}
          onClick={() => {
            setUploadMessage!('');
            setShowUploadCSVModal!(true);
          }}
        />
      </Group>

      <Footer />
    </>
  );
};

export default VotersConfig;
