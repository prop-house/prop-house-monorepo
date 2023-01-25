import classes from './LoadingIndicator.module.css';
import ReactLoading from 'react-loading';

const LoadingIndicator: React.FC<{
  color?: string;
  height?: number;
  width?: number;
}> = props => {
  const { color, height, width } = props;
  return (
    <div className={classes.container}>
      <ReactLoading
        type={'cylon'}
        color={color ? color : 'gray'}
        height={height ? height : 100}
        width={width ? width : 100}
      />
    </div>
  );
};

export default LoadingIndicator;
