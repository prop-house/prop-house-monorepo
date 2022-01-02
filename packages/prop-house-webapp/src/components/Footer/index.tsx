import classes from './Footer.module.css';
import heartNoun from '../../assets/heart-noun.png';
import { Image } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { toggleDisplayAdmin } from '../../state/slices/configuration';

const Footer = () => {
  const dispatch = useDispatch();
  return (
    <div className={classes.footerContainer}>
      <div className={classes.footer}>
        Made with <Image src={heartNoun} onClick={() => dispatch(toggleDisplayAdmin())} />
      </div>
    </div>
  );
};

export default Footer;
