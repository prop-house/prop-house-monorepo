import classes from './ERC20Buttons.module.css';
import React from 'react';
import Group from '../Group';
import AwardAddress from '../AwardAddress';
import clsx from 'clsx';
import { getERC20Image } from '../../../utils/getERC20Image';
import { ERC20 } from '../AwardsConfig';
import { Award } from '../AssetSelector';
import Divider from '../../Divider';

/**
 * @overview
 * The predefined ERC20 token buttons or "Other" that reveals the address input for a custom ERC20.
 *
 * @see erc20Tokens - The list of predefined ERC20 tokens to map over & display
 */

export const erc20Tokens: ERC20[] = [ERC20.ETH, ERC20.WETH, ERC20.USDC, ERC20.APE, ERC20.OTHER];

const ERC20Buttons: React.FC<{
  award: Award;
  isTyping: boolean;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
  handleSelectAward: (token: ERC20) => void;
}> = props => {
  const { award, isTyping, handleBlur, handleChange, handleSwitch, handleSelectAward } = props;

  const renderTokenButtons = () => {
    return erc20Tokens.map(token => (
      <Group row gap={4} key={token}>
        <button
          className={clsx(
            classes.strategyButton,
            classes.tokenButton,
            award.selectedAsset === token ? classes.btnPurpleBg : classes.btnWhiteBg,
          )}
          onClick={() => handleSelectAward(token)}
        >
          {token !== ERC20.OTHER && (
            <img className={classes.tokenImage} src={getERC20Image(token)} alt="token" />
          )}
          <span>{token}</span>
        </button>
      </Group>
    ));
  };

  return (
    <>
      <Group row gap={8} classNames={classes.buttons}>
        {renderTokenButtons()}
      </Group>

      {/* the custom address input */}
      {award.selectedAsset === ERC20.OTHER && (
        <>
          <Divider />
          <Group gap={6}>
            <AwardAddress
              award={award}
              isTyping={isTyping}
              handleBlur={handleBlur}
              handleSwitch={handleSwitch}
              handleChange={handleChange}
            />
          </Group>
        </>
      )}
    </>
  );
};

export default ERC20Buttons;
