import classes from './Dropdown.module.css';
import { Dropdown as DropdownBS } from 'react-bootstrap';
import clsx from 'clsx';
import { useState } from 'react';

const Dropdown: React.FC<{ values: string[]; classNames: string }> = props => {
  const { values, classNames } = props;

  const [selectedValue, setSelectedValue] = useState('Select');

  return (
    <div className={clsx(classes.container, 'phDropdown', classNames)}>
      <DropdownBS>
        <DropdownBS.Toggle variant="success" id="dropdown-basic">
          {selectedValue}
        </DropdownBS.Toggle>

        <DropdownBS.Menu>
          {values.map((v, idx) => (
            <DropdownBS.Item key={idx} onClick={() => setSelectedValue(v)}>
              <span>{v}</span>
            </DropdownBS.Item>
          ))}
        </DropdownBS.Menu>
      </DropdownBS>
    </div>
  );
};

export default Dropdown;
