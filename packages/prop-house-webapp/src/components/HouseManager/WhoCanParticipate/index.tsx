import Footer from '../Footer';
import Group from '../Group';
import VotingStrategyModal from '../VotingStrategyModal';
import { useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Text from '../Text';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import UploadCSVModal from '../UploadCSVModal';
import { updateRound } from '../../../state/slices/round';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';
import {
  VotingStrategyType,
  AssetType,
  VotingStrategyInfo,
  WhitelistMember,
  Whitelist,
  BalanceOfWithTokenID,
  BalanceOf,
} from '@prophouse/sdk/dist/types';
import VotingStrategy from '../VotingStrategy';

export enum AddressType {
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155',
  ERC20 = 'ERC-20',
  Allowlist = 'Allowlist',
}
export enum ERC20 {
  ETH = 'ETH',
  WETH = 'WETH',
  USDC = 'USDC',
  APE = 'APE',
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

const newStrategy: NewStrategy = {
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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [showVotingStrategyModal, setShowVotingStrategyModal] = useState(false);

  const round = useAppSelector(state => state.round.round);

  const [strat, setStrat] = useState<NewStrategy>(newStrategy);
  const [strategies, setStrategies] = useState<VotingStrategyInfo[]>(
    round.strategies.length ? round.strategies : [],
  );
  const [selectedStrategy, setSelectedStrategy] = useState<string>(AddressType.ERC721);

  const dispatch = useAppDispatch();

  // const handleAddVotingStrategy = () => {
  //   let s: VotingStrategyInfo | null = null;

  //   if (strat.type === VotingStrategyType.BALANCE_OF) {
  //     if (strat.asset === AssetType.ERC1155) {
  //       s = {
  //         strategyType: strat.type,
  //         assetType: strat.asset,
  //         address: strat.address,
  //         tokenId: strat.tokenId,
  //         multiplier: strat.multiplier,
  //       };
  //     } else {
  //       s = {
  //         strategyType: VotingStrategyType.BALANCE_OF,
  //         assetType: AssetType.ERC20,
  //         address: strat.address,
  //         multiplier: strat.multiplier,
  //       };
  //     }
  //   } else if (strat.type === VotingStrategyType.WHITELIST) {
  //     const newMember: WhitelistMember = {
  //       address: strat.address,
  //       votingPower: strat.multiplier.toString(),
  //     };
  //     s={
  //       strategyType: VotingStrategyType.WHITELIST,
  //       members:  [newMember]
  //     }

  //     // const existingStrategies = round.strategies.filter(
  //     //   s => s.strategyType === VotingStrategyType.WHITELIST,
  //     // );

  //     //   if (existingStrategies.length > 0) {
  //     //     // Whitelist strategy already exists; add the new member to it
  //     //     const whitelistStrategy = existingStrategies[0];
  //     //     if ('members' in whitelistStrategy) {
  //     //       whitelistStrategy.members.push(newMember);
  //     //       s = whitelistStrategy;
  //     //     } else {
  //     //       console.error('Invalid strategy type');
  //     //     }
  //     //   } else {
  //     //     // Create a new Whitelist strategy with the new member
  //     //     s = {
  //     //       strategyType: VotingStrategyType.WHITELIST,
  //     //       members: [newMember],
  //     //     };
  //     //   }
  //     // } else {
  //     //   console.error('Invalid strategy type');
  //     // }

  //     const existingWhitelistIndex = round.strategies.findIndex(
  //       s => s.strategyType === VotingStrategyType.WHITELIST,
  //     );
  //     if (existingWhitelistIndex !== -1) {
  //       const whitelistStrategy = round.strategies[existingWhitelistIndex];
  //       if ('members' in whitelistStrategy) {
  //         // // Directly update the members array with the new member
  //         // whitelistStrategy.members = [...whitelistStrategy.members, newMember];
  //         s = {
  //           ...whitelistStrategy,
  //           members: [...whitelistStrategy.members, newMember],
  //         };
  //       } else {
  //         console.error('Invalid strategy type');
  //       }
  //     } else {
  //       // Create a new Whitelist strategy with the new member
  //       s = {
  //         strategyType: VotingStrategyType.WHITELIST,
  //         members: [newMember],
  //       };
  //     }
  //   } else {
  //     console.error('Invalid strategy type');
  //   }

  //   if (s) {
  //     const updatedStrategies = round.strategies.filter(
  //       s => s.strategyType !== VotingStrategyType.WHITELIST,
  //     );
  //     updatedStrategies.push(s);
  //     dispatch(updateRound({ ...round, strategies: updatedStrategies }));

  //     setStrategies(updatedStrategies);
  //   }

  //   // if (s) {
  //   //   const updatedStrategies = round.strategies.filter(
  //   //     s => s.strategyType !== VotingStrategyType.WHITELIST,
  //   //   );
  //   //   updatedStrategies.push(s);
  //   //   console.log(updatedStrategies);
  //   //   dispatch(updateRound({ ...round, strategies: updatedStrategies }));
  //   //   setStrategies([...strategies, s]);
  //   // }

  //   setStrat(newStrategy);
  //   handleCloseModal();
  // };
  const handleAddVotingStrategy = () => {
    let s: VotingStrategyInfo | null = null;

    if (strat.type === VotingStrategyType.BALANCE_OF) {
      if (strat.asset === AssetType.ERC1155) {
        s = {
          strategyType: strat.type,
          assetType: strat.asset,
          address: strat.address,
          tokenId: strat.tokenId,
          multiplier: strat.multiplier,
        };
      } else {
        s = {
          strategyType: VotingStrategyType.BALANCE_OF,
          assetType: AssetType.ERC20,
          address: strat.address,
          multiplier: strat.multiplier,
        };
      }
    } else if (strat.type === VotingStrategyType.WHITELIST) {
      const newMember: WhitelistMember = {
        address: strat.address,
        votingPower: strat.multiplier.toString(),
      };
      s = {
        strategyType: VotingStrategyType.WHITELIST,
        members: [newMember],
      };
    }

    if (s) {
      let updatedStrategies: VotingStrategyInfo[] = [];

      if (s.strategyType === VotingStrategyType.WHITELIST) {
        // Find existing Whitelist strategy
        const existingStrategyIndex = round.strategies.findIndex(
          existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
        );

        if (existingStrategyIndex > -1) {
          const existingStrategy = round.strategies[existingStrategyIndex];

          // Type guard to ensure existing strategy is a Whitelist strategy
          if ('members' in existingStrategy) {
            // Update existing Whitelist strategy by spreading in existing members
            const updatedStrategy = {
              ...existingStrategy,
              members: [...existingStrategy.members, ...s.members],
            };
            updatedStrategies = [
              ...round.strategies.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...round.strategies.slice(existingStrategyIndex + 1),
            ];
          } else {
            console.error('Invalid strategy type');
          }
        } else {
          // Add a new Whitelist strategy
          updatedStrategies = [...round.strategies, s];
        }
      } else {
        // Add non-Whitelist strategy
        updatedStrategies = [...round.strategies, s];
      }

      // Update the state or dispatch an action with the updated strategies
      dispatch(updateRound({ ...round, strategies: updatedStrategies }));
      setStrategies(updatedStrategies);
    }

    setStrat(newStrategy);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setStrat(newStrategy);
    setShowVotingStrategyModal(false);
    setSelectedStrategy(AddressType.ERC721);
  };

  const handleSelectStrategy = (selectedType: AddressType) => {
    setSelectedStrategy(selectedType);

    if (selectedType === AddressType.ERC721 || selectedType === AddressType.ERC20) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.BALANCE_OF,
        asset: selectedType === AddressType.ERC721 ? AssetType.ERC721 : AssetType.ERC20,
      });
    } else if (selectedType === AddressType.ERC1155) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.BALANCE_OF,
        asset: AssetType.ERC1155,
      });
    } else if (selectedType === AddressType.Allowlist) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.WHITELIST,
      });
    }
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(strat.address);

  const handleAddressBlur = async () => {
    setIsTyping(false);

    // if address is empty, dont do anything
    if (!strat.address) {
      setStrat({ ...strat, state: 'input' });
      return;
    }

    const isDuplicate = strategies.some(s => {
      if (
        s.strategyType !== VotingStrategyType.WHITELIST &&
        s.strategyType !== VotingStrategyType.VANILLA
      ) {
        return s.address.toLowerCase() === strat.address.toLowerCase();
      } else if (s.strategyType === VotingStrategyType.WHITELIST) {
        return s.members.some(m => m.address.toLowerCase() === strat.address.toLowerCase());
      } else {
        return null;
      }
    });

    if (isDuplicate) {
      setStrat({
        ...strat,
        state: 'error',
        error: 'Address already exists',
      });
      return;
    }

    // if address isn't valid, set error
    if (!data) {
      setStrat({ ...strat, state: 'error', error: 'Invalid address' });
      return;
    }

    // if address is EOA, check against string vs AssetType
    if (strat.type === VotingStrategyType.WHITELIST) {
      if (data !== 'EOA') {
        setStrat({
          ...strat,
          state: 'error',
          error: `Expected EOA and got ${data}`,
        });
      } else {
        setStrat({ ...strat, state: 'success' });
      }

      return;
      // if address is not EOA, check against AssetType
    } else if (AssetType[strat.asset] !== data) {
      setStrat({
        ...strat,
        state: 'error',
        error: `Expected ${AssetType[strat.asset]} and got ${data}`,
      });

      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const tokenInfo = await getTokenInfo(strat.address);
      const { name, collectionName, image } = tokenInfo;

      if (!name || !image) {
        setStrat({ ...strat, state: 'error', error: 'Unidentifed address' });
        return;
      } else {
        setStrat({
          ...strat,
          state: 'success',
          name: name === 'Unidentified contract' ? collectionName : name,
          image,
        });
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setIsTyping(true);
    setStrat({ ...strat, address: value });
  };

  const handleSwitchInput = () => setStrat({ ...strat, state: 'input' });

  const handleAddressClear = () =>
    setStrat({
      ...strat,
      address: '',
      multiplier: 1,
      tokenId: '1',
      state: 'input',
      name: '',
      image: '',
    });

  const handleVoteChange = (votes: number) => setStrat({ ...strat, multiplier: votes });

  const handleTokenIdChange = (tokenId: string) => setStrat({ ...strat, tokenId });

  // const handleRemoveStrategy = (address: string, type: string) => {
  //   if (type === VotingStrategyType.VANILLA) return;

  //   let updatedStrategies;

  //   if (type === VotingStrategyType.WHITELIST) {
  //     updatedStrategies = strategies.map(s => {
  //       if (s.strategyType === VotingStrategyType.WHITELIST) {
  //         return {
  //           ...s,
  //           members: s.members.filter(m => m.address !== address),
  //         };
  //       } else {
  //         return s;
  //       }
  //     });
  //   } else {
  //     updatedStrategies = strategies.filter(s => 'address' in s && s.address !== address);
  //   }

  //   dispatch(updateRound({ ...round, strategies: updatedStrategies }));
  //   setStrategies(updatedStrategies);
  // };
  const handleRemoveStrategy = (address: string, type: string) => {
    if (type === VotingStrategyType.VANILLA) return;

    let updatedStrategies;

    if (type === VotingStrategyType.WHITELIST) {
      updatedStrategies = strategies.map(s => {
        if (s.strategyType === VotingStrategyType.WHITELIST) {
          return {
            ...s,
            members: s.members.filter(m => m.address !== address),
          };
        } else {
          return s;
        }
      });
    } else {
      updatedStrategies = strategies.filter(s => {
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    dispatch(updateRound({ ...round, strategies: updatedStrategies }));
    setStrategies(updatedStrategies);
  };

  const addDummyStrategies = () => {
    const dummyStrategies = [
      {
        strategyType: VotingStrategyType.WHITELIST,
        members: [
          { address: '0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4', votingPower: '1' },
          { address: '0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00', votingPower: '1' },
          { address: '0xd604b77486193813482550478711D58cf48c742d', votingPower: '1' },
        ],
      } as Whitelist,
      {
        strategyType: VotingStrategyType.BALANCE_OF,
        assetType: AssetType.ERC1155,
        tokenId: '12',
        address: '0x7c2748c7ec984b559eadc39c7a4944398e34911a',
        multiplier: 1,
      } as BalanceOfWithTokenID,
      {
        strategyType: VotingStrategyType.BALANCE_OF,
        assetType: AssetType.ERC721,
        address: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
        multiplier: 1,
      } as BalanceOf,
      {
        strategyType: VotingStrategyType.BALANCE_OF,
        assetType: AssetType.ERC20,
        address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
        multiplier: 1,
      } as BalanceOf,
    ];

    const updatedStrategies = [...strategies, ...dummyStrategies];
    setStrategies(updatedStrategies);
    dispatch(updateRound({ ...round, strategies: updatedStrategies }));
  };

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
          strategy={strat}
          isTyping={isTyping}
          selectedStrategy={selectedStrategy}
          handleVote={handleVoteChange}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleCloseModal={handleCloseModal}
          handleOnChange={handleAddressChange}
          handleTokenIdChange={handleTokenIdChange}
          handleSelectStrategy={handleSelectStrategy}
          handleAddVotingStrategy={handleAddVotingStrategy}
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

      <Group gap={12} mb={12}>
        {strategies.map((s, idx) =>
          s.strategyType === VotingStrategyType.VANILLA ? (
            <></>
          ) : s.strategyType === VotingStrategyType.WHITELIST ? (
            s.members.map((m, idx) => (
              <VotingStrategy
                key={idx}
                type={s.strategyType}
                address={m.address}
                multiplier={Number(m.votingPower)}
                removeStrategy={handleRemoveStrategy}
              />
            ))
          ) : (
            <VotingStrategy
              key={idx}
              type={s.strategyType}
              address={s.address}
              multiplier={s.multiplier}
              removeStrategy={handleRemoveStrategy}
            />
          ),
        )}
      </Group>

      <Group row gap={6}>
        <Button
          onClick={() => setShowVotingStrategyModal(true)}
          text={'Add a strategy'}
          bgColor={ButtonColor.Pink}
        />

        <Button
          onClick={() => setShowVotingStrategyModal(true)}
          text={'Upload CSV'}
          bgColor={ButtonColor.White}
        />
        <Button onClick={addDummyStrategies} text={'Add Data'} bgColor={ButtonColor.Green} />
      </Group>

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
