import Group from '../Group';
import Text from '../Text';
import classes from './InstructionBox.module.css';

const InstructionBox: React.FC<{
  title: string;
  text: string;
  image?: string;
}> = props => {
  const { title, text, image } = props;

  return (
    <Group gap={2} classNames={classes.box}>
      <Group row gap={12}>
        {image && (
          <div className={classes.imgContainer}>
            <img className={classes.img} src={image} alt="instruction" />
          </div>
        )}
        <Group>
          <Text type="subtitle">{title}</Text>
          <Text type="body">{text}</Text>
        </Group>
      </Group>
    </Group>
  );
};

export default InstructionBox;
