/**
 * Non-zero address used for balance slot detection
 */
export const ADDRESS_ONE = '0x0000000000000000000000000000000000000001';

/**
 * The `balanceOf` function signature.
 */
export const BALANCE_OF_FUNC = 'function balanceOf(address account)';

/**
 * A JavaScript tracer that's used to detect the slot index of the first mapping that's read.
 * This tracer returns the slot index as well as the number of mapping reads.
 */
export const BALANCE_OF_TRACER = `{
  count: 0,
  prev: undefined,
  index: '-1',
  fault: function(log) {},
  step: function(log) {
    if(this.count === 0 && log.op.toString() === 'MSTORE') {
      this.index = log.stack.peek(1);
    }
    if(['SHA3', 'KECCAK256'].includes(this.prev) && log.op.toString() === 'SLOAD'){
      this.count += 1;
    }
    this.prev = log.op.toString();
  },
  result: function() {
    return {
      slotIndex: this.index,
      readCount: this.count
    };
  }
}`;
