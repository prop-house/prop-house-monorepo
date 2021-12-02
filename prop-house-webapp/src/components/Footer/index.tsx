import classes from './Footer.module.css';
import heartNoun from '../../assets/heart-noun.png';
import { Image } from 'react-bootstrap';

const Footer = () => {
  return (
    <div className={classes.footerContainer}>
      <div className={classes.footer}>
        Made with <Image src={heartNoun} />
      </div>
    </div>
  );
};

export default Footer;
