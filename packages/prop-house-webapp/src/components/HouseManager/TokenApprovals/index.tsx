import classes from './TokenApprovals.module.css';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import CardWrapper from '../CardWrapper';
import Group from '../Group';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import InstructionBox from '../InstructionBox';
import ApprovalWidget from '../ApprovalWidget';
import { Award } from '../AssetSelector';
import { saveRound } from '../../../state/thunks';
import { AssetType } from '@prophouse/sdk-react';

const TokenApprovals = () => {
  const round = useAppSelector(state => state.round.round);
  const dispatch = useDispatch();

  // Initialize empty arrays for tokens and NFTs. We only want to show one card per token/NFT for approval purposes, even if there are multiple awards for that token/NFT.
  const tokens: Award[] = [];
  const nfts: Award[] = [];

  // Loop through each award in the round.
  round.awards.forEach(award => {
    // Check if the award is a token (either ETH or ERC20 type).
    if (award.type === AssetType.ETH || award.type === AssetType.ERC20) {
      // Try to find an existing award in the tokens array that has the same type and address as the current award.
      const existingEthAward = tokens.find(
        item => item.type === award.type && item.address === award.address,
      );

      // If there isn't an existing award with the same type and address in the tokens array, add the current award.
      if (!existingEthAward) tokens.push(award);
    }
    // Check if the award is an NFT (either ERC721 or ERC1155 type).
    else if (award.type === AssetType.ERC721 || award.type === AssetType.ERC1155) {
      // Try to find an existing award in the NFTs array that has the same type, address, and id as the current award.
      const existingNftAward = nfts.find(
        item => item.type === award.type && item.address === award.address && item.id === award.id,
      );

      // If there isn't an existing award with the same type, address, and id in the NFTs array, add the current award.
      if (!existingNftAward) nfts.push(award);
    }
  });

  const handleCheckboxChange = () =>
    dispatch(saveRound({ ...round, depositingFunds: !round.depositingFunds }));

  return (
    <>
      <Group gap={16}>
        <Group row classNames={classes.titleAndCheckbox}>
          <Text type="title">Deposit funds for the round?</Text>
          <input
            type="checkbox"
            id="depositFunds"
            name="depositFunds"
            checked={round.depositingFunds}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="depositFunds"></label>
        </Group>

        <InstructionBox
          title="Funding now vs later"
          text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
        />

        {round.depositingFunds ? (
          <>
            {tokens.length ? (
              <Group gap={8}>
                <Text type="title">Tokens</Text>
                <CardWrapper>
                  {tokens.map(token => (
                    <ApprovalWidget award={token} amount={token.amount} />
                  ))}
                </CardWrapper>
              </Group>
            ) : (
              <> </>
            )}

            {tokens.length && nfts.length ? <Divider noMarginDown /> : <></>}

            {nfts.length ? (
              <Group gap={8}>
                <Text type="title">NFTs</Text>
                <CardWrapper>
                  {nfts.map(nft => (
                    <ApprovalWidget award={nft} amount={nft.amount} />
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
