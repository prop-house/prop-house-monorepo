import React from 'react';
import classes from './ManagerInstruction.module.css';

const ManagerInstruction: React.FC<{
  number: number;
  title: string;
  instruction: string;
  optional?: boolean;
  button?: React.ReactNode;
}> = props => {
  const { number, title, instruction, optional, button } = props;

  return (
    <>
      <div className={classes.instructionSection}>
        <div className={classes.instructionTitle}>
          <span className={classes.number}>{number}</span>

          <div className={classes.titleAndOptional}>
            {optional && <span className={classes.optional}>Optional</span>}
            <span>{title}</span>
          </div>
        </div>

        <p className={classes.instruction}>{instruction}</p>

        {button && button}
      </div>
    </>
  );
};

export default ManagerInstruction;
