import classes from './DualSectionSelector.module.css';
import React, { ReactNode } from 'react';

const DualSectionSelector: React.FC<{
  children: ReactNode;
  onChange: () => void;
}> = props => {
  const { children, onChange } = props;

  return (
    <div className={classes.container}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return (
            <div
              className={classes.section}
              onClick={() => {
                if (!child.props.active) {
                  onChange();
                }
              }}
            >
              {child}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default DualSectionSelector;
