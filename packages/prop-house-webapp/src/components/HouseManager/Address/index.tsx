import { useState } from 'react';
import Input from '../Input';
import classes from './Address.module.css';

const Address: React.FC<{ placeholder: string }> = props => {
  const { placeholder } = props;

  const [address, setAddress] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searching, setSearching] = useState(false);

  return (
    <div className={classes.container}>
      <Input
        inputType="text"
        placeholder={placeholder}
        value={address}
        onChange={e => setAddress(e.target.value)}
      />

      {searching && <div>searching...</div>}
    </div>
  );
};

export default Address;
