import classes from './Footer.module.css';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import bgColorForFooter from '../../utils/bgColorForFooter';

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className={clsx(classes.footerContainer, bgColorForFooter(location.pathname))}>
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
