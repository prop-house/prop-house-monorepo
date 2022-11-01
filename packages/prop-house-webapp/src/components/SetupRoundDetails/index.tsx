import classes from './SetupRoundDetails.module.css';
import Divider from '../Divider';
import { Dropdown } from 'react-bootstrap';
import clsx from 'clsx';
import Button, { ButtonColor } from '../Button';

const SetupRoundDetails = () => {
  const roundTypes = ['Timed', 'Infinite', 'Custom'];
  return (
    <>
      <div className={classes.detailsContainer}>
        <div className={classes.detailsSection}>
          <p className={classes.title}>Round type</p>
          <div className={clsx(classes.dropdown, 'houseDropdown')}>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Timed
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {roundTypes.map((type, index) => (
                  <Dropdown.Item
                    key={index}
                    // onClick={() => handleClick(s.status)}
                  >
                    <span>{type}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className={classes.detailsSection}>
          <p className={classes.title}>Voting strategy</p>

          <div className={classes.roundSetupButtons}>
            <Button text="Token Balance" bgColor={ButtonColor.Purple} />
            <Button text="Token w/ Multiplier" bgColor={ButtonColor.White} />
            <Button text="Allowlist" bgColor={ButtonColor.White} />
          </div>
        </div>

        <Divider />

        <div className={classes.detailsSection}>
          <p className={classes.title}>Reward funds</p>
        </div>
      </div>
    </>
  );
};

export default SetupRoundDetails;
