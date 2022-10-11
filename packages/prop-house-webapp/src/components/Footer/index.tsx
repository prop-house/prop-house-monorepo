import classes from './Footer.module.css';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import bgColorForFooter from '../../utils/bgColorForFooter';
import { FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa';
import { externalURL, ExternalURL } from '../../utils/externalURLs';

const Footer = () => {
  const location = useLocation();

  const discordURL = externalURL(ExternalURL.discord);
  const twitterURL = externalURL(ExternalURL.twitter);
  const githubURL = externalURL(ExternalURL.github);

  return (
    <div className={clsx(classes.footerContainer, bgColorForFooter(location.pathname))}>
      <div className={classes.footer}>
        <a href={discordURL} target="_blank" rel="noreferrer">
          <FaDiscord />
        </a>

        <a href={twitterURL} target="_blank" rel="noreferrer">
          <FaTwitter />
        </a>

        <a href={githubURL} target="_blank" rel="noreferrer">
          <FaGithub />
        </a>
      </div>
    </div>
  );
};

export default Footer;
