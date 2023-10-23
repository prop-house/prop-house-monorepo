import classes from './InfoSymbol.module.css';
import { MdInfoOutline } from 'react-icons/md';

const InfoSymbol = () => (
  <span className={classes.symbol}>
    <MdInfoOutline />
  </span>
);

export default InfoSymbol;
