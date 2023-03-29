import Divider from '../../Divider';
import Header from '../Header';
import { useAppSelector } from '../../../hooks';
import Text from '../Text';
import Footer from '../Footer';
import AssetSelector from '../AssetSelector';

const AwardsConfig = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

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
