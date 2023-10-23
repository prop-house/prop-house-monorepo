import { FC } from 'react';
import buildOpenSeaPath from '../utils/buildOpenSeaPath';
import classes from './ViewOnOpenSeaButton.module.css';

const ViewOnOpenSeaButton: FC<{ address: string; isDisabled: boolean }> = props => {
  const { address, isDisabled } = props;

  return (
    <button
      className={classes.container}
      onClick={() => window.open(buildOpenSeaPath(address), '_blank')}
      disabled={isDisabled}
    >
      <img
        src={'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg'}
        alt="opensea"
      />
      <span>View on OpenSea</span>
    </button>
  );
};

export default ViewOnOpenSeaButton;
