import classes from './SetupRoundDetails.module.css';
import Divider from '../Divider';
import { Dropdown } from 'react-bootstrap';
import clsx from 'clsx';
import Button, { ButtonColor } from '../Button';
import { useState } from 'react';
import Input from '../Input';

const SetupRoundDetails = () => {
  const [numOfWinners, setNumOfWinners] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);

  const roundTypes = ['Timed', 'Infinite', 'Custom'];
  const fundTypes = ['ETH', 'USDC', 'Nounlet'];

  return (
    <>
      <div className={classes.detailsContainer}>
        <div className={classes.detailsSection}>
          <p className={classes.title}>Round type</p>
          <div className={clsx(classes.dropdown, 'phDropdown')}>
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

          <div className={classes.rewardFunds}>
            <div className={clsx(classes.dropdown, classes.fundsDropdown, 'phDropdown')}>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  ETH
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {fundTypes.map((fund, index) => (
                    <Dropdown.Item
                      key={index}
                      // onClick={() => handleClick(s.status)}
                    >
                      <span>{fund}</span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <Input
              title="Winners"
              type="number"
              row
              value={numOfWinners}
              classNames={classes.winnersInput}
              onChange={e => setNumOfWinners(Number(e.target.value))}
              placeholder=""
              // onFocus={() => setInputIsInFocus(true)}
            />

            <Input
              title="Amount"
              type="number"
              row
              value={rewardAmount}
              classNames={classes.rewardInput}
              onChange={e => setRewardAmount(Number(e.target.value))}
              placeholder=""
              // onFocus={() => setInputIsInFocus(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SetupRoundDetails;
