import classes from './ScrollButton.module.css';
import { IoArrowDown } from 'react-icons/io5';
import { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx';

const ScrollButton: React.FC<{
  setToggleScrollButton: Dispatch<SetStateAction<boolean>>;
  hideButton: boolean;
  setHideButton: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setToggleScrollButton, hideButton, setHideButton } = props;

  return (
    <>
      <div className={clsx(classes.scrollToBottomBtn, hideButton && classes.hideButton)}>
        <button
          onClick={() => {
            setToggleScrollButton(true);
            setHideButton(true);
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
