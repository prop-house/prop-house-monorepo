// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IDepositReceiver } from '../../interfaces/IDepositReceiver.sol';

abstract contract DepositReceiver is IDepositReceiver {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IDepositReceiver).interfaceId;
    }
}
