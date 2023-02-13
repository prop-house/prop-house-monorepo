import classes from './AddAddressWithVotes.module.css';
import Address from '../Address';
import VotesPerToken from '../VotesPerToken';
import XButton from '../XButton';
import { capitalize } from '../../../utils/capitalize';
import Text from '../Text';

export interface AddressTypeProps {
  type: 'user' | 'contract';
}

const AddAddressWithVotes: React.FC<AddressTypeProps> = props => {
  const { type } = props;

  return (
    <div className={classes.container}>
      <div className={classes.addressAndTitle}>
        <Text type="subtitle">{capitalize(type)} Address</Text>
        <Address placeholder="ex: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03" />
      </div>

      <VotesPerToken />

      <XButton />
    </div>
  );
};

export default AddAddressWithVotes;
