import { ReactElement } from 'react-markdown/lib/react-markdown';
import classes from './Banner.module.css';

const Banner: React.FC<{ content: ReactElement }> = props => {
  return <div className={classes.banner}>{props.content}</div>;
};

export default Banner;
