import { addressFormLink } from '../../utils/addressFormLink';
import CTA from '../CTA';
import { useTranslation } from 'react-i18next';
import { openInNewTab } from '../../utils/openInNewTab';

const ContactUsCTA = () => {
  const { t } = useTranslation();

  return (
    <CTA
      title={t('supercharge')}
      content={t('interested')}
      btnAction={() => {
        openInNewTab(addressFormLink);
      }}
      btnTitle={t('contactUs')}
    />
  );
};

export default ContactUsCTA;
