import classes from './Footer.module.css';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import bgColorFor, { BgColorElement } from '../../utils/bgColorFor';
import { externalURL, ExternalURL } from '../../utils/externalURLs';
import tos from '../../assets/files/prophouse-tos.pdf';

const Footer = () => {
  const location = useLocation();

  return (
    <div
      className={clsx(
        classes.footerContainer,
        bgColorFor(BgColorElement.Footer, location.pathname),
      )}
    >
      <div className={classes.footer}>
        <a href={externalURL(ExternalURL.gitbook)} target="_blank" rel="noreferrer">
          FAQs
        </a>
        ·
        <a href={externalURL(ExternalURL.offchain)} target="_blank" rel="noreferrer">
          offchain app
        </a>
        ·
        <a href={externalURL(ExternalURL.twitter)} target="_blank" rel="noreferrer">
          @nounsprophouse
        </a>
        ·
        <a href={externalURL(ExternalURL.github)} target="_blank" rel="noreferrer">
          github
        </a>
        ·
        <a href={tos} download>
          terms of service
        </a>
      </div>
    </div>
  );
};

export default Footer;
