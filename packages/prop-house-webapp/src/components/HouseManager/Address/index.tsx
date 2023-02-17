import classes from './Address.module.css';

const Address: React.FC<{
  value: string;
  handleChange: any;
  handleBlur: any;
  placeholder: string;
}> = props => {
  const { value, handleChange, handleBlur, placeholder } = props;

  return (
    <div className={classes.container}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default Address;
