import clsx from 'clsx';
import classes from './Text.module.css';

/**
 * @overview
 * Generic text component with pre-defined styles.
 *
 * @notes
 * @see links are "text buttons" that take an onClick prop
 */

interface TextProps {
  type: 'heading' | 'title' | 'subtitle' | 'body' | 'link' | 'error';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  classNames?: string;
}

const Text: React.FC<TextProps> = ({ type, disabled, onClick, children, classNames }) => {
  return type === 'link' ? (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(classes.link, disabled && classes.disabled, classNames && classNames)}
    >
      {children}
    </button>
  ) : (
    <p className={clsx(classes[type], disabled && classes.disabled, classNames && classNames)}>
      {children}
    </p>
  );
};

export default Text;
