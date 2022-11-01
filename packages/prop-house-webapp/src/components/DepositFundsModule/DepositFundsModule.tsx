import clsx from 'clsx';
import { useState } from 'react';
import classes from './DepositFundsModule.module.css';

const DepositFundsModule = () => {
  const [balance, setBalance] = useState(100.238);
  return (
    <>
      <div className={classes.rewardSection}>
        <p className={classes.subtitle}>Deposit funds</p>

        <div className={classes.depositFundsContainer}>
          <div className={classes.row}>
            <div className={classes.currencySelector}>
              <img className={classes.currencyImg} src="/ethSymbol.png" alt="currency-type" />
              <p className={classes.currencyType}>ETH</p>
            </div>
            <div className={classes.fundsValue}>0.00</div>
          </div>

          <div className={classes.row}>
            <div className={clsx(classes.row, classes.balance)}>
              <div className={classes.balanceAmount}>{`Balance: ${balance}`}</div>
              <div className={classes.balanceBtn} onClick={() => setBalance(999.999)}>
                <span>MAX</span>
              </div>
            </div>

            <div className={classes.balanceAmount}>$00.00</div>
          </div>
        </div>

        <p className={classes.depositFundsNote}>
          Some text should go here 'bout how you can deposit funds for you [or others] to use on
          oneor multiple rounds. You can also do this later and top it off at any time.
        </p>
      </div>
    </>
  );
};

export default DepositFundsModule;
