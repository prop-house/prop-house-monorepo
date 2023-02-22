import Group from '../Group';
import Text from '../Text';
import classes from './InstructionBox.module.css';

const InstructionBox: React.FC<{
  title: string;
  text: string;
}> = props => {
  const { title, text } = props;

  return (
    <Group gap={2} classNames={classes.box}>
      <Text type="subtitle">{title}</Text>
      <Text type="body">{text}</Text>
    </Group>
  );
};

export default InstructionBox;
