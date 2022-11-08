import classes from './ScrollButton.module.css';
import { IoArrowDown } from 'react-icons/io5';
import { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx';

const ScrollButton: React.FC<{
  toggleScrollButton: boolean;
  setToggleScrollButton: Dispatch<SetStateAction<boolean>>;
  setHideScrollButton: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { toggleScrollButton, setToggleScrollButton, setHideScrollButton } = props;

  return (
    <>
      <div className={clsx(classes.scrollToBottomBtn, toggleScrollButton && classes.hideButton)}>
        <button
          onClick={() => {
            setHideScrollButton(true);
            setToggleScrollButton(true);
          }}
        >
          <>
            <span>More</span>
            <IoArrowDown />
          </>
        </button>
      </div>
    </>
  );
};

export default ScrollButton;
