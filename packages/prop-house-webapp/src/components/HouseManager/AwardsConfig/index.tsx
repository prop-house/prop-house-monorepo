import Divider from '../../Divider';
import Header from '../Header';
import { useAppSelector } from '../../../hooks';
import Text from '../Text';
import Footer from '../Footer';
import AssetSelector from '../AssetSelector';

/**
 * @overview
 * Step 4 - user sets the awards for the round, either split evenly or by a custom config
 *
 * @components
 * @name AssetSelector - the modal that allows the user to add a new voting strategy, we abstract here to allow direct access to the award selector in the edit modal
 *
 * @notes
 * @see ERC20 - button options for editing the split award. ETH, common ERC20 tokens, or custom erc-20 address
 * @see AwardType - button options for individual awards
 */

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

const AwardsConfig = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider />

      <Header
        title="What will the winners be awarded?"
        subtitle="Specify the awards paid out for the winning props. Any ties will go to the prop created first."
      />

      <AssetSelector />

      <Footer />
    </>
  );
};

export default AwardsConfig;
