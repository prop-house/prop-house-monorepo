import classes from './ERC20Buttons.module.css';
import React, { useState } from 'react';
import Group from '../Group';
import clsx from 'clsx';
import { getERC20Image } from '../../../utils/getERC20Image';

import { DefaultERC20s, EditableAsset, ERC20_TOKEN_ADDRESSES_BY_CHAIN } from '../AssetSelector';
import { useChainId } from 'wagmi';

/**
 * @overview
 * The predefined ERC20 token buttons or "Other" that reveals the address input for a custom ERC20.
 *
 * @see erc20Tokens - The list of predefined ERC20 tokens to map over & display
 */

export const ERC20Buttons: React.FC<{
  asset: EditableAsset;
  handleSelectAward: (token: DefaultERC20s) => void;
}> = props => {
  const { asset, handleSelectAward } = props;

  const erc20Tokens: DefaultERC20s[] = [DefaultERC20s.USDC, DefaultERC20s.OTHER];
  const [selectedOther, setSelectedOther] = useState(false);
  const chainId = useChainId();

  return (
    <>
      <Group row gap={8} classNames={classes.buttons}>
        {erc20Tokens.map(token => (
          <Group row gap={4} key={token}>
            <button
              className={clsx(
                classes.strategyButton,
                classes.tokenButton,
                (asset.address === ERC20_TOKEN_ADDRESSES_BY_CHAIN[chainId][token] &&
                  token !== DefaultERC20s.OTHER) ||
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
    </>
  );
};

export default ERC20Buttons;
