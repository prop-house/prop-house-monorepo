import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BackendHost } from '../../state/slices/configuration';
import clsx from 'clsx';
import classes from './DevEnvDropdown.module.css';

const DevEnvDropDown = () => {
  const navigate = useNavigate();

  const handleClick = (env: BackendHost) => {
    localStorage.setItem('devEnv', env.toString());
    navigate(0);
  };

  return (
    <div className={clsx(classes.dropdown, 'houseDropdown')}>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic" className={classes.dropDownBtn}>
          ENV
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {process.env.REACT_APP_NODE_ENV === BackendHost.Local && (
            <Dropdown.Item onClick={() => handleClick(BackendHost.Local)}>local</Dropdown.Item>
          )}
          <Dropdown.Item onClick={() => handleClick(BackendHost.Dev)}>dev</Dropdown.Item>
          <Dropdown.Item onClick={() => handleClick(BackendHost.Prod)}>prod</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default DevEnvDropDown;
