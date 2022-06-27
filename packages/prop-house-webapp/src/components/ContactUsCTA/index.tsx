import { addressFormLink } from "../../utils/addressFormLink";
import CTA from "../CTA";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

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
