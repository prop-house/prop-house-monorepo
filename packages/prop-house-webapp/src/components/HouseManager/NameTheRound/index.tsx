import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import Input from '../Input';
import Text from '../Text';

const NameTheRound = () => {
  return (
    <>
      <Header title="What's your round about?" />

      <Group>
        <Text type="subtitle">Round name</Text>
        <Input placeholder={'Hack-a-thon'} value={''} onChange={() => {}} />
      </Group>

      <Group>
        <Text type="subtitle">Describe your round</Text>
        <Input
          type="textarea"
          placeholder={
            'Describe the round. Think about the goals, timeline and how you will encourage builders to participate.'
          }
          value={''}
          onChange={() => {}}
        />
      </Group>

      <Footer />
    </>
  );
};

export default NameTheRound;
