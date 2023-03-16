import classes from './VotingStrategyModal.module.css';
import React, { useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Group from '../Group';
import { ERC20 } from '../WhoCanParticipate';
// import Address from '../Address';
// import ViewOnEtherscanButton from '../ViewOnEtherscanButton';

import clsx from 'clsx';

const VotingStrategyModal: React.FC<{}> = props => {
  // const {} = props;

  const erc20Tokens: ERC20[] = [ERC20.ETH, ERC20.WETH, ERC20.USDC, ERC20.APE];

  const getTokenImage = (token: ERC20) => {
    switch (token) {
      case ERC20.ETH:
        return '/manager/eth.png';
      case ERC20.WETH:
        return '/manager/weth.svg';
      case ERC20.USDC:
        return '/manager/usdc.svg';
      case ERC20.APE:
        return '/manager/ape.png';
      default:
        return '';
    }
  };

  const renderTokenButtons = () => {
    return erc20Tokens.map(token => (
      <Group row gap={4} key={token}>
        <button
          className={clsx(
            classes.strategyButton,
            classes.tokenButton,
            selectedERC20 === token ? classes.btnPurpleBg : classes.btnWhiteBg,
          )}
          onClick={() => {
            setCustomERC20(false);
            setSelectedERC20(token);
          }}
          // onClick={() => handleSelectStrategy(token)}
        >
          <img className={classes.tokenImage} src={getTokenImage(token)} alt="token" />
          <span>{token}</span>
        </button>
      </Group>
    ));
  };

  const [customERC20, setCustomERC20] = useState<boolean>(false);
  const [selectedERC20, setSelectedERC20] = useState<string>(ERC20.ETH);

  return (
    <>
      <Group row gap={8} classNames={classes.buttons}>
        {renderTokenButtons()}

        <div className={classes.container}>
          <Button
            classNames={classes.strategyButton}
            text={'Other'}
            bgColor={customERC20 ? ButtonColor.Purple : ButtonColor.White}
            onClick={() => {
              setCustomERC20(true);
              setSelectedERC20('');
            }}
          />
        </div>
      </Group>

      {customERC20 && (
        <>
          {/* <Address
            strategy={strategy}
            isTyping={isTyping}
            handleBlur={handleBlur}
            handleClear={handleClear}
            handleSwitch={handleSwitch}
            handleChange={handleOnChange}
          /> */}
          {/* <ViewOnEtherscanButton address={strategy.address} isDisabled={!verifiedAddress} /> */}
        </>
      )}
    </>
  );
};

export default VotingStrategyModal;
