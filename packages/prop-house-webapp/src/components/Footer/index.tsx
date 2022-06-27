import classes from "./Footer.module.css";
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

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.footerContainer}>
      <div className={classes.footer}>
        {t("questions")}{" "}
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
          style={{ marginRight: "0.5rem" }}
        >
          {t("dmsOpen")}
        </a>
        {t("joinUs")}{" "}
        <a
          href="https://discord.com/invite/SKPzM8GHts"
          target="_blank"
          rel="noreferrer"
        >
          {t("discord")}
        </a>
      </div>
    </div>
  );
};

export default Footer;
