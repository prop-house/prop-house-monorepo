import Text from '../Text';
import Divider from '../../Divider';

const RoundName: React.FC<{ name: string }> = props => {
  const { name } = props;

  return (
    <>
      <Text type="heading">{name}</Text>
      <Divider narrow />
    </>
  );
};

export default RoundName;
