import Button, { ButtonColor } from '../../Button';
import Text from '../Text';
import classes from './VotesPerToken.module.css';

const VotesPerToken: React.FC = () => {
  return (
    <>
      <div className={classes.container}>
        <Text type="subtitle">Votes per token</Text>

        <div className={classes.inputAndButtons}>
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
        </div>
      </div>
    </>
  );
};

export default VotesPerToken;
