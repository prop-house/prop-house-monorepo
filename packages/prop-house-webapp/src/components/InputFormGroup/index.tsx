import React, { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';
import classes from '../ProposalInputs/ProposalInputs.module.css';

interface InputFormGroupProps {
  titleLabel: string;
  content: ReactElement;
  charsLabel?: string;
  formGroupClasses?: string;
}

const InputFormGroup: React.FC<InputFormGroupProps> = ({
  titleLabel,
  content,
  charsLabel,
  formGroupClasses,
}) => (
  <Form.Group className={clsx(classes.inputGroup, formGroupClasses && formGroupClasses)}>
    <div className={classes.inputSection}>
      <div className={classes.inputInfo}>
        <Form.Label className={classes.inputLabel}>{titleLabel}</Form.Label>
        <Form.Label className={classes.inputChars}>{charsLabel}</Form.Label>
      </div>
      {content}
    </div>
  </Form.Group>
);

export default InputFormGroup;
