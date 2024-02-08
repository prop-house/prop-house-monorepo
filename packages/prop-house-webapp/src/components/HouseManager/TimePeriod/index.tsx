import classes from './TimePeriod.module.css';
import Button, { ButtonColor } from '../../Button';

const CustomPeriod: React.FC<{
  onClick: any;
  selectedPeriod: boolean;
  disabled?: boolean;
}> = props => {
  const { selectedPeriod, onClick, disabled } = props;

  return (
    <div className={classes.container}>
      <Button
        classNames={classes.periodButton}
        onClick={onClick}
        disabled={disabled}
        text="Custom"
        bgColor={selectedPeriod ? ButtonColor.Purple : ButtonColor.White}
      />
    </div>
  );
};

const TimePeriod: React.FC<{
  days: number;
  onClick: any;
  selectedPeriod: boolean;
  disabled?: boolean;
}> = props => {
  const { onClick, days, selectedPeriod, disabled } = props;

  return (
    <div className={classes.container}>
      <Button
        classNames={classes.periodButton}
        onClick={onClick}
        disabled={disabled}
        text={`${days} ${days === 1 ? `day` : `days`}`}
        bgColor={selectedPeriod ? ButtonColor.Purple : ButtonColor.White}
      />
    </div>
  );
};

export { CustomPeriod, TimePeriod };
