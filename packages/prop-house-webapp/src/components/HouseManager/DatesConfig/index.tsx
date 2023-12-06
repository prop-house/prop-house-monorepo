import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import Footer from '../Footer';
import Header from '../Header';
import RoundDatesSelector from '../RoundDatesSelector';
import Text from '../Text';

/**
 * @overview
 * Step 5 - user sets the start date and the proposal & voting period duration
 *
 * @components
 * @name RoundDatesSelector - component to select dates for the round, we abstract here to allow direct access to the dates selector in the edit modal
 */

const DatesConfig = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider />

      <Header
        title="How long should the round run?"
        subtitle="Rounds are divided into two phases: the proposing period, which starts when the round begins, and the voting period, which follows the proposing period. Once the voting period concludes, the winners are determined."
      />
      <RoundDatesSelector />
      <Footer />
    </>
  );
};

export default DatesConfig;
