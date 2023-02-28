import Divider from '../../Divider';
import Header from '../Header';
import { useAppSelector } from '../../../hooks';
import Text from '../Text';
import AwardsSelector from '../AwardsSelector';
import Footer from '../Footer';

const SetTheAwards = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

      <Header
        title="What will the winners be awarded?"
        subtitle="Specify the awards paid out for the winning props. Any ties will go to the prop created first."
      />

      <AwardsSelector />

      <Footer />
    </>
  );
};

export default SetTheAwards;
