import { addressFormLink } from '../../utils/addressFormLink';
import CTA from '../CTA';

const ContactUsCTA = () => (
  <CTA
    title="Supercharge your nounish community"
    content="Interested in running your own community Prop House? Reach out to see
how we can work together to make it happen!"
    btnAction={() => {
      window.open(addressFormLink, '_blank');
    }}
    btnTitle="Contact us"
  />
);

export default ContactUsCTA;
