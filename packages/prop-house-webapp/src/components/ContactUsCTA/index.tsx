import CTA from '../CTA';

const ContactUsCTA = () => (
  <CTA
    title="Supercharge your nounish community"
    content="Interested in running your own community Prop House? Reach out to see
how we can work together to make it happen!"
    btnAction={() => {
      window.open(
        'https://www.addressform.io/form/1fa6ca57-60e2-4a16-aee4-37e1adabb0f7',
        '_blank'
      );
    }}
    btnTitle="Contact us"
  />
);

export default ContactUsCTA;
