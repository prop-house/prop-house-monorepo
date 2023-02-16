import classes from './AddressWithVotes.module.css';
import Address from '../Address';
import { capitalize } from '../../../utils/capitalize';
import Text from '../Text';
import Group from '../Group';
import Button, { ButtonColor } from '../../Button';
import { useState } from 'react';
import { AddressWithVotesProps } from '../WhoCanParticipate';

const AddressWithVotes: React.FC<{
  type: string;
  index: number;
  address: AddressWithVotesProps;
  addresses: AddressWithVotesProps[];
  remove: (id: string) => void;
  onAddressValueChange: (id: string, newValue: string) => void;
  onVotesPerTokenChange: (id: string, newValue: number) => void;
}> = props => {
  const { type, index, address, addresses, remove, onAddressValueChange, onVotesPerTokenChange } =
    props;

  const [addressValue, setAddressValue] = useState(address.addressValue);

  const handleAddressValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAddressValue(newValue);
    onAddressValueChange(address.id, newValue);
  };

  const handleDecrement = () => {
    if (address.votesPerToken > 0) {
      onVotesPerTokenChange(address.id, address.votesPerToken - 1);
    }
  };

  const handleIncrement = () => {
    onVotesPerTokenChange(address.id, address.votesPerToken + 1);
  };

  const disableRemoveButton = addresses.length === 1;

  return (
    <div key={index} className={classes.container}>
      <Group gap={4} classNames={classes.addressAndTitle}>
        <Text type="subtitle">{capitalize(type)} Address</Text>
        <Address
          value={addressValue}
          handleChange={handleAddressValueChange}
          placeholder="ex: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03"
        />
      </Group>

      <div className={classes.voteContainer}>
        <Group gap={4}>
          <Text type="subtitle">Votes per token</Text>

          <Group row gap={4}>
            <input
              value={address.votesPerToken}
              type="text"
              onChange={e => onVotesPerTokenChange(address.id, parseInt(e.target.value))}
            />
            <div className={classes.allotButtons}>
              <Button
                text="-"
                classNames={classes.button}
                bgColor={ButtonColor.Gray}
                onClick={handleDecrement}
                disabled={address.votesPerToken === 0}
              />
              <Button
                text="+"
                classNames={classes.button}
                bgColor={ButtonColor.Gray}
                onClick={handleIncrement}
              />
            </div>
          </Group>
        </Group>
      </div>

      <Button
        text="X"
        classNames={classes.xButton}
        bgColor={ButtonColor.White}
        onClick={() => remove(address.id)}
        disabled={disableRemoveButton}
      />
    </div>
  );
};

export default AddressWithVotes;
