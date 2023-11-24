/**
 * This function takes an ERC20 token and returns the image path for that token.
 * @param token The ERC20 token
 * @returns the image path for the token
 */

import { DefaultERC20s } from '../components/HouseManager/AssetSelector';

export const getERC20Image = (token: DefaultERC20s) => {
  switch (token) {
    case DefaultERC20s.USDC:
      return '/manager/usdc.svg';
    case DefaultERC20s.APE:
      return '/manager/ape.png';
    default:
      return '/manager/token.svg';
  }
};
