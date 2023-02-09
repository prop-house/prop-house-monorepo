import clsx from 'clsx';
import Text from '../Text';
import classes from './Section.module.css';

const Section: React.FC<{
  id: number;
  title: string;
  text: string;
  activeSection: number;
}> = props => {
  const { id, title, text, activeSection } = props;

  const active = id === activeSection;

  return (
    <div className={clsx(classes.container, active ? classes.active : '')}>
      <div className={classes.textContainer}>
        <Text type="subtitle" disabled={!active}>
          {title}
        </Text>

        <Text type="body" disabled={!active}>
          {text}
        </Text>
      </div>
    </div>
  );
};

export default Section;
