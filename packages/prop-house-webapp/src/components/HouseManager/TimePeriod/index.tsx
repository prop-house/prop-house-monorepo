import classes from './TimePeriod.module.css';
import Button, { ButtonColor } from '../../Button';

const CustomPeriod: React.FC<{ onClick: any; selectedPeriod: boolean }> = props => {
  const { selectedPeriod, onClick } = props;

  return (
    <div className={classes.container}>
      <Button
        classNames={classes.periodButton}
        onClick={onClick}
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
}> = props => {
  const { onClick, days, selectedPeriod } = props;

  return (
    <div className={classes.container}>
      <Button
        classNames={classes.periodButton}
        onClick={onClick}
        text={`${days} ${days === 1 ? `day` : `days`}`}
        bgColor={selectedPeriod ? ButtonColor.Purple : ButtonColor.White}
      />
    </div>
  );
};

export { CustomPeriod, TimePeriod };
