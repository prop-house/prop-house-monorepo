import { addressFormLink } from "../../utils/addressFormLink";
import CTA from "../CTA";
import { useTranslation } from "react-i18next";

const ContactUsCTA = () => {
  const { t } = useTranslation();

  return (
    <CTA
      title={t("supercharge")}
      content={t("interested")}
      btnAction={() => {
        window.open(addressFormLink, "_blank");
      }}
      btnTitle={t("contactUs")}
    />
  );
};

export default ContactUsCTA;
