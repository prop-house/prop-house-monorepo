import classes from './DualSectionSelector.module.css';
import React from 'react';

const DualSectionSelector: React.FC<{
  children: React.ReactNode;
  setActiveSection: React.Dispatch<React.SetStateAction<number>>;
}> = props => {
  const { children, setActiveSection } = props;

  return (
    <div className={classes.container}>
      {React.Children.map(children, (child, index) => (
        <div className={classes.section} onClick={() => setActiveSection(index)}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default DualSectionSelector;
