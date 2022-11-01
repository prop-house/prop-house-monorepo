import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { useState } from 'react';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import classes from './ManagerStrategiesSection.module.css';

const ManagerStrategiesSection = () => {
  const [multiplierAmount, setMultiplierAmount] = useState(0);
  const [allottedMultiplierAmount, setAllottedMultiplierAmount] = useState(0);
  const [inputIsInFocus, setInputIsInFocus] = useState(false);

  const isAllotting = () => allottedMultiplierAmount > 0 || inputIsInFocus;

  const handleArrowClick = (direction: Direction) => {
    setAllottedMultiplierAmount(prev => (direction === Direction.Up ? prev + 1 : prev - 1));
    setMultiplierAmount(prev => (direction === Direction.Up ? prev + 1 : prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    setMultiplierAmount(Number(value));
  };

  return (
    <>
      <div className={classes.supportedStrategiesSection}>
        <p className={classes.title}>Supported strategies</p>
        <p className={classes.subtitle}>
          Select any possible the voting strategies that should be avaliable to use on any later
          rounds created for your House. You can decide on which strategy to use when creating each
          Round.
        </p>

        <div className={classes.strategy}>
          <input type="checkbox" />

          <div className={classes.sections}>
            <div className={classes.section}>
              <p className={classes.title}>Token balance</p>
              <p className={classes.subtitle}>One vote per each ERC20/ERC721 held.</p>
            </div>

            <div className={classes.section}>
              <p className={classes.title}>Token contract address</p>
              <input placeholder="0x830BD73E4184ceF73443C15111a1DF14e495C706" type="text" />
            </div>
          </div>
        </div>

        <Divider />

        <div className={classes.strategy}>
          <input type="checkbox" />

          <div className={classes.sections}>
            <div className={classes.section}>
              <p className={classes.title}>Token Balance with a Multiplier</p>
              <p className={classes.subtitle}>
                Choose how many votes are allotted for each ERC20/ERC721 held.
              </p>
            </div>

            <div className={classes.section}>
              <p className={classes.title}>Token contract address</p>
              <input placeholder="0x830BD73E4184ceF73443C15111a1DF14e495C706" type="text" />
            </div>

            <div className={classes.section}>
              <p className={classes.title}>Token Multiplier</p>
              <p className={classes.subtitle}>
                Each ERC20/ERC721 will get{' '}
                <span className={classes.multiplierAmount}>10 votes</span>.
              </p>

              <div className={classes.multiplierInputAndBtns}>
                <input
                  type="number"
                  // value={displayWarningTooltip ? attemptedInputVotes : voteCount}
                  value={multiplierAmount}
                  className={classes.multiplierInput}
                  onChange={e => handleInputChange(e)}
                  onFocus={() => setInputIsInFocus(true)}
                />
                <div className={classes.multiplierBtns}>
                  <Button
                    text="↓"
                    bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
                    classNames={classes.arrowBtn}
                    onClick={() => handleArrowClick(Direction.Down)}
                    disabled={multiplierAmount === 0}
                  />
                  <Button
                    text="↑"
                    bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
                    classNames={classes.arrowBtn}
                    onClick={() => handleArrowClick(Direction.Up)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerStrategiesSection;
