import clsx from 'clsx';
import React from 'react';
import classes from './ManagerInstruction.module.css';
import { FaCheck as CheckIcon } from 'react-icons/fa';

const ManagerInstruction: React.FC<{
  activeStep: number;
  number: number;
  title: string;
  instruction: string;
  optional?: boolean;
  button?: React.ReactNode;
}> = props => {
  const { activeStep, number, title, instruction, optional, button } = props;

  const completedStep = () => activeStep > number;

  return (
    <>
      <div className={classes.instructionSection}>
        <div className={classes.instructionTitle}>
          <span className={clsx(classes.number, completedStep() && classes.pinkBg)}>
            {completedStep() ? (
              <span className={classes.check}>
                <CheckIcon />
              </span>
            ) : (
              number
            )}
          </span>

          <div className={classes.titleAndOptional}>
            {optional && <span className={classes.optional}>Optional</span>}
            <span>{title}</span>
          </div>
        </div>

        {!completedStep() && (
          <>
            <p className={classes.instruction}>{instruction}</p>

            {button && button}
          </>
        )}
      </div>
    </>
  );
};

export default ManagerInstruction;
