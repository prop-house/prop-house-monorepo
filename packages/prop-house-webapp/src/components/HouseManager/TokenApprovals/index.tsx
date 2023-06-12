import classes from './TokenApprovals.module.css';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import CardWrapper from '../CardWrapper';
import Group from '../Group';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import InstructionBox from '../InstructionBox';
import ApprovalWidget from '../ApprovalWidget';
import { saveRound } from '../../../state/thunks';
import { AssetType } from '@prophouse/sdk-react';
import { NewRound, Token } from '../../../state/slices/round';

import { useEffect } from 'react';

const TokenApprovals = () => {
  const round = useAppSelector(state => state.round.round);
  const dispatch = useDispatch();

  useEffect(() => {
    // Calculate the total amount required for each unique token
    const totalTokenAmounts: { [address: string]: number } = {};

    round.awards.forEach(award => {
      const key = award.type === AssetType.ETH ? 'ETH' : award.address;

      if (!totalTokenAmounts[key]) totalTokenAmounts[key] = 0;

      totalTokenAmounts[key] += award.amount;
    });

    // Create tokens array
    const tokens: Token[] = [];

    for (const [address, total] of Object.entries(totalTokenAmounts)) {
      // Find the first award with the same address

      const award =
        address === 'ETH'
          ? round.awards.find(a => a.type === AssetType.ETH)
          : round.awards.find(a => a.address === address);

      tokens.push({
        type: address === 'ETH' ? AssetType.ETH : AssetType.ERC20,
        address,
        total,
        allocated: 0,
        image: award?.image,
        symbol: award?.symbol,
        name: award?.name,
        tokenId: award?.tokenId,
      });
    }

    // Update the round with the new tokens array
    let updated = {
      ...round,
      funding: {
        ...round.funding,
        tokens,
      },
    };

    // Dispatch an action to save the new round
    dispatch(saveRound(updated));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.awards]); // Only run when awards change

  const erc20AndEthTokens = round.funding.tokens.filter(
    token => token.type === AssetType.ETH || token.type === AssetType.ERC20,
  );
  const erc721And1155Tokens = round.funding.tokens.filter(
    token => token.type === AssetType.ERC721 || token.type === AssetType.ERC1155,
  );

  const allocateFundsAndCheckFundingStatus = (allocated: number, award: Token) => {
    let updatedRound: NewRound;

    // Update the allocated amount in the funding.tokens array
    updatedRound = {
      ...round,
      funding: {
        ...round.funding,
        tokens: round.funding.tokens.map(token => {
          if (token.address === award.address) {
            return { ...token, allocated };
          } else {
            return token;
          }
        }),
      },
    };

    // Update the round in the state
    dispatch(saveRound(updatedRound));
  };

  const handleCheckboxChange = () => {
    if (!round.funding.depositingFunds)
      dispatch(
        saveRound({
          ...round,
          funding: {
            ...round.funding,
            depositingFunds: true,
          },
        }),
      );
    // if we're toggling off 'deposit funds now' then we want to reset the fullyFunded flag as well
    else
      dispatch(
        saveRound({
          ...round,
          funding: {
            ...round.funding,
            depositingFunds: false,
          },
          //  fullyFunded: false
        }),
      );
  };

  return (
    <>
      <Group gap={16}>
        <Group row classNames={classes.titleAndCheckbox}>
          <Text type="title">Deposit funds for the round?</Text>
          <input
            type="checkbox"
            id="depositFunds"
            name="depositFunds"
            checked={round.funding.depositingFunds}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="depositFunds"></label>
        </Group>

        <InstructionBox
          title="Funding now vs later"
          text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
        />

        {/* {round.depositingFunds ? ( */}
        {round.funding.depositingFunds ? (
          <>
            {round.funding.tokens.length ? (
              <Group gap={8}>
                <Text type="title">Tokens</Text>

                <CardWrapper>
                  {erc20AndEthTokens.map(token => (
                    <ApprovalWidget
                      key={token.address}
                      award={token}
                      handleAllocation={allocateFundsAndCheckFundingStatus}
                      total={token.total}
                    />
                  ))}
                </CardWrapper>
              </Group>
            ) : (
              <> </>
            )}

            {erc20AndEthTokens.length && erc721And1155Tokens.length ? (
              <Divider noMarginDown />
            ) : (
              <></>
            )}

            {erc721And1155Tokens.length ? (
              <Group gap={8}>
                <Text type="title">NFTs</Text>
                <CardWrapper>
                  {erc721And1155Tokens.map(nft => (
                    <ApprovalWidget
                      key={nft.address}
                      award={nft}
                      handleAllocation={allocateFundsAndCheckFundingStatus}
                      total={nft.total}
                    />
                  ))}
                </CardWrapper>
              </Group>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
      </Group>
    </>
  );
};

export default TokenApprovals;
