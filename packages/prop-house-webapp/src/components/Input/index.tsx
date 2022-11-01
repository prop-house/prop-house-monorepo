import classes from './Input.module.css';

const Input: React.FC<{
  title: string;
  placeholder: string;
  note?: string;
}> = props => {
  const { title, placeholder, note } = props;

  return (
    <div className={classes.inputContainer}>
      <p className={classes.inputTitle}>{title}</p>
      <input placeholder={placeholder} />
      {note && <span className={classes.inputNote}>{note}</span>}
    </div>
  );
};

export default Input;
