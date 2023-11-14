import { ERC20 } from '../components/HouseManager/AwardsConfig';

/**
 * This function takes an ERC20 token and returns the image path for that token.
 * @param token The ERC20 token
 * @returns the image path for the token
 */

export const getERC20Image = (token: ERC20) => {
  switch (token) {
    case ERC20.USDC:
      return '/manager/usdc.svg';
    case ERC20.APE:
      return '/manager/ape.png';
    default:
      return '';
  }
};
