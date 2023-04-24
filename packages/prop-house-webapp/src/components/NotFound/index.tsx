import classes from './NotFound.module.css';
import hardhatNoun from '../../assets/hardhat-noun.png';

const NotFound = () => {
  return (
    <div className={classes.invalidAddressCard}>
      <img
        src={hardhatNoun}
        alt="invalid address noun"
        className={classes.invalidAddressNoun}
      />
      <div className={classes.textContainer}>
        <h1>Invalid URL</h1>
        <p>
          Please check that the url follows the format:
          <br />
          <code>prop.house/:house_address/:round_address?</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
