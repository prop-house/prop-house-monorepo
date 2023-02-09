import Button, { ButtonColor } from '../../Button';
import { AddressTypeProps } from '../AddAddressWithVotes';
import Text from '../Text';
import classes from './VotesPerToken.module.css';

const VotesPerToken: React.FC<AddressTypeProps> = props => {
  const { type } = props;

  return (
    <>
      <div className={classes.container}>
        <Text type="subtitle">Votes per token</Text>

        <div className={classes.inputAndButtons}>
          {type === 'contract' && (
            <>
              <input value={10} type="text" />
              <div className={classes.allotButtons}>
                <Button
                  text="-"
                  classNames={classes.button}
                  bgColor={ButtonColor.Gray}
                  onClick={() => {}}
                />

                <Button
                  text="+"
                  classNames={classes.button}
                  bgColor={ButtonColor.Gray}
                  onClick={() => {}}
                />
              </div>
            </>
          )}

          {type === 'user' && (
            <>
              <input value={10} type="text" />{' '}
              <Button
                text="Edit"
                classNames={classes.editButton}
                bgColor={ButtonColor.White}
                onClick={() => {}}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VotesPerToken;
