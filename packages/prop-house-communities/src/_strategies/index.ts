import { balanceOfErc721 } from './balanceOfErc721';
import { CaseInsensitiveMap } from '../types/CaseInsensitiveMap';
import { balanceOfErc20 } from './balanceOfErc20';
import { fixedNum } from './fixedNum';
import { validEnsAndMinBal } from './validEnsAndMinBal';

export const _strategies = new CaseInsensitiveMap(
  Object.entries({
    balanceOfErc721: balanceOfErc721,
    balanceOfErc20: balanceOfErc20,
    fixedNum: fixedNum,
    validEnsAndMinBal: validEnsAndMinBal,
  }),
);
