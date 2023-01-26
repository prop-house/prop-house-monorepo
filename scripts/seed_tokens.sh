#!/bin/sh

export CARROT=0xEac6E5dfAdf947D45Ef83F27F2c2e20Eca5184b1
export NOUNPUNKS=0xE169c2ED585e62B1d32615BF2591093A629549b6
export ALICE=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
export BOB=0x70997970c51812dc3a010c7d01b50e0d17dc79c8

export DAI=0x6b175474e89094c44da98b954eedeac495271d0f
export LUCKY_USER=0xad0135af20fa82e106607257143d0060a7eb5cbf

TRANSFER="safeTransferFrom(address,address,uint256)"
OWNEROF="ownerOf(uint256)"

# Transfer NounPunks from carrots stream account to test accounts
cast call $NOUNPUNKS "$OWNEROF" 6494

cast rpc anvil_impersonateAccount $CARROT

cast send --from $CARROT $NOUNPUNKS \
	"$TRANSFER" \
	$CARROT \
	$ALICE \
	7689

cast send --from $CARROT $NOUNPUNKS \
	"$TRANSFER" \
	$CARROT \
	$ALICE \
	1217

cast send --from $CARROT $NOUNPUNKS \
	"$TRANSFER" \
	$CARROT \
	$ALICE \
	6494

cast call $NOUNPUNKS "$OWNEROF" 6494
