import classes from './ThumbsUpButton.module.css';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import TruncateThousands from '../TruncateThousands';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';

const ThumbsUpDownButton: React.FC<{
  thumbsUp: boolean;
  handleClick: (event: any, direction: Direction) => void;
  selected: boolean;
  disabled: boolean;
  amount: number;
}> = props => {
  const { thumbsUp, handleClick, selected, disabled, amount } = props;

  return (
    <button
      onClick={e => handleClick(e, thumbsUp ? Direction.Up : Direction.Down)}
      disabled={disabled}
      className={clsx(
        classes.votingBtn,
        selected && thumbsUp ? classes.up : selected && !thumbsUp ? classes.down : '',
      )}
    >
      {thumbsUp ? <FiThumbsUp /> : <FiThumbsDown />}
      <TruncateThousands amount={amount} />
    </button>
  );
};

export default ThumbsUpDownButton;
