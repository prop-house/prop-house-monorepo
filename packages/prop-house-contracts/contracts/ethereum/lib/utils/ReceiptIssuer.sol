// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IReceiptIssuer } from '../../interfaces/IReceiptIssuer.sol';

abstract contract ReceiptIssuer is IReceiptIssuer {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IReceiptIssuer).interfaceId;
    }
}
