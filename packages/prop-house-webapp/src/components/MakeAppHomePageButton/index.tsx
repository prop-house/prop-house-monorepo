import { useState } from 'react';
import classes from './MakeAppHomePageButton.module.css';
import { IoMdCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';

const MakeAppHomePageButton: React.FC = () => {
  const [show, setShow] = useState(true);
  const handleClick = (makeIt: boolean) => {
    localStorage.setItem('makeAppHomePage', makeIt ? 'yes' : 'no');
    setShow(false);
  };

  return show ? (
    <div className={classes.container}>
      <p>Make app the home page </p>
      <div className={classes.btnContainers}>
        <IoMdCheckmarkCircle size={26} onClick={() => handleClick(true)} />
        <IoMdCloseCircle size={26} onClick={() => handleClick(false)} />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default MakeAppHomePageButton;
