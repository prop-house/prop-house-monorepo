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
          style={{marginRight: "0.5rem"}}
        >
          DMs open. 
        </a>
        Want to join us? <a
          href="https://discord.gg/prophouse"
          target="_blank"
          rel="noreferrer"
        >
          Go to Discord.
        </a>
      </div>
    </div>
  );
};

export default Footer;
