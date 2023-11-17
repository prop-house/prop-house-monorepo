import classes from './ERC20Buttons.module.css';
import React, { useState } from 'react';
import Group from '../Group';
import AwardAddress from '../AwardAddress';
import clsx from 'clsx';
import { getERC20Image } from '../../../utils/getERC20Image';
import { DefaultERC20s, EditableAsset, erc20TokenAddresses } from '../AssetSelector';
import Divider from '../../Divider';

/**
 * @overview
 * The predefined ERC20 token buttons or "Other" that reveals the address input for a custom ERC20.
 *
 * @see erc20Tokens - The list of predefined ERC20 tokens to map over & display
 */

export const ERC20Buttons: React.FC<{
  award: EditableAsset;
  isTyping: boolean;
  handleBlur: () => void;
  handleSwitch: () => void;
  handleChange: (value: string) => void;
  handleSelectAward: (token: DefaultERC20s) => void;
}> = props => {
  const { award, isTyping, handleBlur, handleChange, handleSwitch, handleSelectAward } = props;

  const erc20Tokens: DefaultERC20s[] = [DefaultERC20s.USDC, DefaultERC20s.APE, DefaultERC20s.OTHER];

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
                (award.address === erc20TokenAddresses[token] && token !== DefaultERC20s.OTHER) ||
                  (selectedOther && token === DefaultERC20s.OTHER)
                  ? classes.btnPurpleBg
                  : classes.btnWhiteBg,
              )}
              onClick={() => {
                handleSelectAward(token);
                token === DefaultERC20s.OTHER && setSelectedOther(true);
              }}
            >
              {token !== DefaultERC20s.OTHER && (
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
