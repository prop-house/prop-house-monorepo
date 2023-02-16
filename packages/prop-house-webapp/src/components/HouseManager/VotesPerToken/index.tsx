import classes from './VotesPerToken.module.css';
import Button, { ButtonColor } from '../../Button';
import Text from '../Text';
import Group from '../Group';

const VotesPerToken: React.FC = () => {
  return (
    <>
      <div className={classes.container}>
        <Group gap={4}>
          <Text type="subtitle">Votes per token</Text>

          <Group row gap={4}>
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
          </Group>
        </Group>
      </div>
    </>
  );
};

export default VotesPerToken;
