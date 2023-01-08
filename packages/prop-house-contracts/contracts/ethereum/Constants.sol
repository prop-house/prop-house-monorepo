// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

// ETH pseudo-token address
address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

// Mask used to truncate uint256 values to 250 bits
uint256 constant MASK_250 = 0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

// Empty bytes
bytes constant NULL_BYTES = new bytes(0);

// prettier-ignore
// print(get_selector_from_name("register_house_strategy"))
uint256 constant REGISTER_HOUSE_STRATEGY_SELECTOR = 0x377cce40a22f1b8904235a96284f1b6dc44451c8d7670914040b7948520b507;

// prettier-ignore
// print(get_selector_from_name("register_voting_strategy"))
uint256 constant REGISTER_VOTING_STRATEGY_SELECTOR = 0x8a9207beb9733d5e7212568d21aae1d276a3c89cb2f7f84acbd99f90410b73;
