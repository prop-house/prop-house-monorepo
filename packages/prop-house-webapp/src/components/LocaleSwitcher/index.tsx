import classes from './LocaleSwitcher.module.css';
import clsx from 'clsx';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { BiWorld as World } from 'react-icons/bi';
import i18n from 'i18next';
import { Dispatch, SetStateAction } from 'react';

interface Languages {
  en: Language;
  jp: Language;
}

interface Language {
  nativeName: string;
}

const LocalSwitcher: React.FC<{ setIsNavExpanded: Dispatch<SetStateAction<boolean>> }> = props => {
  const { setIsNavExpanded } = props;

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
          onClick={() => {
            i18n.changeLanguage(lng);
            setIsNavExpanded(false);
          }}
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
