import classes from "./LocaleSwitcher.module.css";
import clsx from "clsx";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useState } from "react";
import { BiWorld as World } from "react-icons/bi";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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

const LocalSwitcher: React.FC<{}> = () => {
  const [lang, setLang] = useState("");

  const handleClick = (e: any) => {
    const target = e.target as HTMLElement;
    setLang(target.innerText);
  };

  return (
    <DropdownButton
      title={<World />}
      // title={lang ? lang : <World />}
      className={clsx(classes.langBtn, "lang")}
      onSelect={(e) => i18n.changeLanguage(e!)}
    >
      <Dropdown.Item as="button" eventKey="en" onClick={handleClick}>
        English
      </Dropdown.Item>

      <Dropdown.Item as="button" eventKey="jp" onClick={handleClick}>
        Japanese
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default LocalSwitcher;
