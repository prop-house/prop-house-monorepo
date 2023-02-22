// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

// ETH pseudo-token address
address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

// Mask used to truncate uint256 values to 250 bits
uint256 constant MASK_250 = 0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

// prettier-ignore
// print(get_selector_from_name("register_round"))
uint256 constant REGISTER_ROUND_SELECTOR = 0x26490f901ea8ad5a245d987479919f1d20fbb0c164367e33ef09a9ea4ba8d04;

// The Prop House entrypoint NFT name
string constant PROP_HOUSE_NAME = 'Prop House';

// The Prop House entrypoint NFT symbol
string constant PROP_HOUSE_SYMBOL = 'PROP';

// The Prop House entrypoint NFT contract URI
string constant PROP_HOUSE_URI = 'ipfs://bafkreifzufef7c2von6dxlcx2en4fwtfpha5qreurdhqyar7vurjmrqi3a';

// The Funding House NFT name
string constant FUNDING_HOUSE_NAME = 'Funding House';

// The Funding House NFT symbol
string constant FUNDING_HOUSE_SYMBOL = 'FUND';
