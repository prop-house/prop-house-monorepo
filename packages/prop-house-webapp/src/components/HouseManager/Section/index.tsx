import clsx from 'clsx';
import Text from '../Text';
import classes from './Section.module.css';

const Section: React.FC<{ title: string; text: string; active: boolean }> = props => {
  const { title, text, active } = props;

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
