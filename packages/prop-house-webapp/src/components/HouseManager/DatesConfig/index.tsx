import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import Footer from '../Footer';
import Header from '../Header';
import RoundDatesSelector from '../RoundDatesSelector';

import Text from '../Text';

const DatesConfig = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

      <Header
        title="How long should the round run?"
        subtitle="Rounds start manually and can have a either a specific or undefined end time depending on what suites the needs for each round."
      />

      <RoundDatesSelector />

      <Footer />
    </>
  );
};

export default DatesConfig;
