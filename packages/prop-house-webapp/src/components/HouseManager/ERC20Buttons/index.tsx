import classes from './ERC20Buttons.module.css';
import React, { useState } from 'react';
import Group from '../Group';
import AwardAddress from '../AwardAddress';
import clsx from 'clsx';
import { getERC20Image } from '../../../utils/getERC20Image';
import { Award, erc20TokenAddresses } from '../AssetSelector';
import Divider from '../../Divider';
import { ERC20 } from '../AwardsConfig';

/**
 * @overview
 * The predefined ERC20 token buttons or "Other" that reveals the address input for a custom ERC20.
 *
 * @see erc20Tokens - The list of predefined ERC20 tokens to map over & display
 */

export const ERC20Buttons: React.FC<{
  award: Award;
  isTyping: boolean;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
  handleSelectAward: (token: ERC20) => void;
}> = props => {
  const { award, isTyping, handleBlur, handleChange, handleSwitch, handleSelectAward } = props;

  const erc20Tokens: ERC20[] = [ERC20.USDC, ERC20.APE, ERC20.OTHER];

  const [selectedOther, setSelectedOther] = useState(false);

  return (
    <>
      <Group row gap={8} classNames={classes.buttons}>
        {erc20Tokens.map(token => (
          <Group row gap={4} key={token}>
            <button
              className={clsx(
                classes.strategyButton,
                classes.tokenButton,
                (award.address === erc20TokenAddresses[token] && token !== ERC20.OTHER) ||
                  (selectedOther && token === ERC20.OTHER)
                  ? classes.btnPurpleBg
                  : classes.btnWhiteBg,
              )}
              onClick={() => {
                handleSelectAward(token);
                token === ERC20.OTHER && setSelectedOther(true);
              }}
            >
              {token !== ERC20.OTHER && (
                <img className={classes.tokenImage} src={getERC20Image(token)} alt="token" />
              )}
              <span>{token}</span>
            </button>
          </Group>
        ))}
      </Group>

      {/* the custom address input */}
      {selectedOther && (
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
