import classes from './Footer.module.css';

const Footer = () => {
  return (
    <div className={classes.footerContainer}>
      <div className={classes.footer}>
        Questions?{' '}
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
        >
          DMs are open
        </a>
      </div>
    </div>
  );
};

export default Footer;
