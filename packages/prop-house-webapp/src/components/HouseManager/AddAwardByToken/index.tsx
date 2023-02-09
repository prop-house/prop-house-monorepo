import classes from './AddAwardByToken.module.css';
import Address from '../Address';
import XButton from '../XButton';
import AwardHeader from '../AwardHeader';
import TokenAmount from '../TokenAmount';

const AddAwardByToken: React.FC<{ place: number }> = props => {
  const { place } = props;

  return (
    <div className={classes.container}>
      <div className={classes.addressAndPlace}>
        <AwardHeader place={place} />
        <Address placeholder="ex: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03" />
      </div>

      <TokenAmount />

      <XButton />
    </div>
  );
};

export default AddAwardByToken;
