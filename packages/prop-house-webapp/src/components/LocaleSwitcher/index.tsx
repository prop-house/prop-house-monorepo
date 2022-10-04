import classes from './LocaleSwitcher.module.css';
import clsx from 'clsx';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { BiWorld as World } from 'react-icons/bi';
import i18n from 'i18next';

interface Languages {
  en: Language;
  jp: Language;
}

interface Language {
  nativeName: string;
}

const LocalSwitcher: React.FC<{}> = () => {
  const lngs: Languages = {
    en: {
      nativeName: 'English',
    },
    jp: {
      nativeName: '日本語',
    },
  };

  return (
    <DropdownButton title={<World />} className={clsx(classes.langBtn, 'lang')}>
      {Object.keys(lngs).map(lng => (
        <Dropdown.Item
          key={lng}
          as="button"
          onClick={() => i18n.changeLanguage(lng)}
          disabled={i18n.resolvedLanguage === lng}
        >
          {lngs[lng as keyof Languages].nativeName}
          <span>
            <img src="/check.png" alt="check" />
          </span>
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

export default LocalSwitcher;
