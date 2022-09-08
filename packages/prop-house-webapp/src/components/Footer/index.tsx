import classes from './Footer.module.css';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isProposalPath = new RegExp('.*/.*/.*/.+');

  const bgShouldBeWhite =
    location.pathname === '/create' ||
    location.pathname === '/faq' ||
    location.pathname === '/learn' ||
    isProposalPath.test(location.pathname);

  return (
    <div className={clsx(classes.footerContainer, bgShouldBeWhite ? 'bgWhite' : 'bgGray')}>
      <div className={classes.footer}>
        {t('questions')}{' '}
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: '0.5rem' }}
        >
          {t('dmsOpen')}
        </a>
        {t('joinUs')}{' '}
        <a href="https://discord.com/invite/SKPzM8GHts" target="_blank" rel="noreferrer">
          {t('discord')}
        </a>
      </div>
    </div>
  );
};

export default Footer;
