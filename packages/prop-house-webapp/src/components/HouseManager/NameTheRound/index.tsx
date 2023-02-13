import { InitialRoundProps, updateRound } from '../../../state/slices/round';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import Input from '../Input';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';

const NameTheRound = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    const newRound = { ...round, [property]: value };
    dispatch(updateRound(newRound));
  };

  return (
    <>
      <Header title="What's your round about?" />

      <Group>
        <Text type="subtitle">Round name</Text>
        <Input
          placeholder={'Hack-a-thon'}
          value={round.title}
          onChange={e => {
            handleChange('title', e.target.value);
          }}
        />
      </Group>

      <Group>
        <Text type="subtitle">Describe your round</Text>
        <Input
          type="textarea"
          placeholder={
            'Describe the round. Think about the goals, timeline and how you will encourage builders to participate.'
          }
          value={round.description}
          onChange={e => {
            handleChange('description', e.target.value);
          }}
        />
      </Group>

      <Footer />
    </>
  );
};

export default NameTheRound;
