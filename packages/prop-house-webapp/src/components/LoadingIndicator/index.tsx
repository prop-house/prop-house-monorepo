import classes from './LoadingIndicator.module.css';
import ReactLoading from 'react-loading';

const LoadingIndicator = () => {
  return (
    <div className={classes.container}>
      <ReactLoading type={'cylon'} color={'gray'} height={100} width={100} />
    </div>
  );
};

export default LoadingIndicator;
