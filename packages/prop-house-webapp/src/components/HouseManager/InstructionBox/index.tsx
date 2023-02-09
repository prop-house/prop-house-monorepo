import Text from '../Text';
import classes from './InstructionBox.module.css';

const InstructionBox: React.FC<{
  title: string;
  text: string;
}> = props => {
  const { title, text } = props;

  return (
    <div className={classes.box}>
      <Text type="subtitle">{title}</Text>
      <Text type="body">{text}</Text>
    </div>
  );
};

export default InstructionBox;
