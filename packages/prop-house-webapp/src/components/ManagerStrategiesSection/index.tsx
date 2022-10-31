import Button, { ButtonColor } from '../Button';
import classes from './ManagerStrategiesSection.module.css';

const ManagerStrategiesSection = () => {
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

        <hr className={classes.divider} />

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
                <input type="checkbox" />
                <div className={classes.multiplierBtns}>
                  <Button
                    text="↓"
                    // bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
                    bgColor={ButtonColor.Gray}
                    classNames={classes.voteBtn}
                    // onClick={e => handleClickVote(e, Direction.Down)}
                    // disabled={}
                  />
                  <Button
                    text="↑"
                    // bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
                    bgColor={ButtonColor.Gray}
                    classNames={classes.voteBtn}
                    // onClick={e => handleClickVote(e, Direction.Up)}
                    // disabled={}
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