import { FC } from 'react';
import buildEtherscanPath from '../utils/buildEtherscanPath';
import classes from './ViewOnEtherscanButton.module.css';

const ViewOnEtherscanButton: FC<{ address: string; isDisabled: boolean }> = props => {
  const { address, isDisabled } = props;

  return (
    <button
      className={classes.container}
      onClick={() => window.open(buildEtherscanPath(address), '_blank')}
      disabled={isDisabled}
    >
      <img
        src={'https://etherscan.io/images/brandassets/etherscan-logo-circle.svg'}
        alt="etherscan logo"
      />
      <span>View on Etherscan</span>
    </button>
  );
};

export default ViewOnEtherscanButton;
