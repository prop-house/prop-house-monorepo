import { useState } from 'react';
import Input from '../Input';
import classes from './Address.module.css';

const Address: React.FC<{ value: string; handleChange: any; placeholder: string }> = props => {
  const { value, handleChange, placeholder } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searching, setSearching] = useState(false);

  return (
    <div className={classes.container}>
      <Input inputType="text" placeholder={placeholder} value={value} onChange={handleChange} />

      {searching && <div>searching...</div>}
    </div>
  );
};

export default Address;
