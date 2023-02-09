import classes from './Text.module.css';

interface TextProps {
  type: 'heading' | 'title' | 'subtitle' | 'body' | 'link' | 'error';
  onClick?: () => void;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({ type, onClick, children }) => {
  return type === 'link' ? (
    <div onClick={onClick} className={classes.link}>
      {children}
    </div>
  ) : (
    <p className={classes[type]}>{children}</p>
  );
};

export default Text;
