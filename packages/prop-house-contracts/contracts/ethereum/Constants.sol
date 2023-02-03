// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

// ETH pseudo-token address
address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

// Mask used to truncate uint256 values to 250 bits
uint256 constant MASK_250 = 0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

// prettier-ignore
// print(get_selector_from_name("register_house_strategy"))
uint256 constant REGISTER_HOUSE_STRATEGY_SELECTOR = 0x377cce40a22f1b8904235a96284f1b6dc44451c8d7670914040b7948520b507;

// The Prop House entrypoint NFT name
string constant PROP_HOUSE_NAME = 'Prop House';

// The Prop House entrypoint NFT symbol
string constant PROP_HOUSE_SYMBOL = 'PROP';

// The Prop House entrypoint NFT contract URI
string constant PROP_HOUSE_URI = '';
