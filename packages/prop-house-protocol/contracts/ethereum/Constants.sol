// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

// ETH pseudo-token address
address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

// The maximum value that can be represented as an unsigned 250-bit integer
uint256 constant MAX_250_BIT_UNSIGNED = 0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

/// @notice Starknet function selector constants
library Selector {
    // print(get_selector_from_name("register_round"))
    uint256 constant REGISTER_ROUND = 0x26490f901ea8ad5a245d987479919f1d20fbb0c164367e33ef09a9ea4ba8d04;

    // print(get_selector_from_name("cancel_round"))
    uint256 constant CANCEL_ROUND = 0x8af3ea41808c9515720e56add54a2d8008458a8bc5e347b791c6d75cd0e407;

    // print(get_selector_from_name("finalize_round"))
    uint256 constant FINALIZE_ROUND = 0x2445872c1b7a1219e1e75f2a60719ce0a68a8442fee1bdbee6c3c649340e6f3;

    // print(get_selector_from_name("route_call_to_round"))
    uint256 constant ROUTE_CALL_TO_ROUND = 0x24931ca109ce0ffa87913d91f12d6ac327550c015a573c7b17a187c29ed8c1a;
}

/// @notice Prop House metadata constants
library PHMetadata {
    // The Prop House NFT name
    string constant NAME = 'Prop House';

    // The Prop House entrypoint NFT symbol
    string constant SYMBOL = 'PROP';

    // The Prop House entrypoint NFT contract URI
    string constant URI = 'ipfs://bafkreiagexn2wbv5t63y2xbf6mmcx3rktrqxrsyzf5gl5l7c2lm3bkqjc4';
}

/// @notice Community house metadata constants
library CHMetadata {
    // The Community House type
    bytes32 constant TYPE = 'COMMUNITY';

    // The Community House NFT name
    string constant NAME = 'Community House';

    // The Community House NFT symbol
    string constant SYMBOL = 'COMM';
}

/// @notice Round type constants
library RoundType {
    // The Timed Round type
    bytes32 constant TIMED = 'TIMED';

    // The Infinite Round type
    bytes32 constant INFINITE = 'INFINITE';
}
