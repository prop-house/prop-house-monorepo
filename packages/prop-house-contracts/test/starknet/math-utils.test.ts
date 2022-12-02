import { StarknetContract } from 'hardhat/types';
import { starknet, ethers } from 'hardhat';
import { utils } from '@snapshot-labs/sx';
import { expect } from 'chai';

describe('Math Utils', () => {
  let testMathUtils: StarknetContract;

  before(async function () {
    this.timeout(800000);
    const testMathUtilsFactory = await starknet.getContractFactory(
      './contracts/starknet/test_contracts/test_math_utils.cairo',
    );
    testMathUtils = await testMathUtilsFactory.deploy();
  });

  it('should covert 4 64 bit words to a Uint256', async () => {
    const word1 = BigInt(utils.bytes.bytesToHex(ethers.utils.randomBytes(2)));
    const word2 = BigInt(utils.bytes.bytesToHex(ethers.utils.randomBytes(2)));
    const word3 = BigInt(utils.bytes.bytesToHex(ethers.utils.randomBytes(2)));
    const word4 = BigInt(utils.bytes.bytesToHex(ethers.utils.randomBytes(2)));
    const { uint256: uint256 } = await testMathUtils.call('test_words_to_uint256', {
      word1,
      word2,
      word3,
      word4,
    });
    const uint = utils.words64.wordsToUint(word1, word2, word3, word4);
    expect(
      new utils.splitUint256.SplitUint256(
        `0x${uint256.low.toString(16)}`,
        `0x${uint256.high.toString(16)}`,
      ),
    ).to.deep.equal(utils.splitUint256.SplitUint256.fromUint(uint));
  }).timeout(600000);

  it('should pack 4 32 bit numbers into a felt', async () => {
    const num1 = utils.bytes.bytesToHex(ethers.utils.randomBytes(1));
    const num2 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    const num3 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    const num4 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    const { packed: packed } = await testMathUtils.call('test_pack_felt', {
      num1,
      num2,
      num3,
      num4,
    });
    const {
      num1: _num1,
      num2: _num2,
      num3: _num3,
      num4: _num4,
    } = await testMathUtils.call('test_unpack_felt', { packed: packed });
    expect(BigInt(num1)).to.deep.equal(_num1);
    expect(BigInt(num2)).to.deep.equal(_num2);
    expect(BigInt(num3)).to.deep.equal(_num3);
    expect(BigInt(num4)).to.deep.equal(_num4);
  });

  it('should fail to pack if a number greater than 32 bits is used', async () => {
    const num1 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    const num2 = '0xfffffffff'; // 36 bits
    const num3 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    const num4 = utils.bytes.bytesToHex(ethers.utils.randomBytes(4));
    try {
      await testMathUtils.call('test_pack_felt', {
        num1,
        num2,
        num3,
        num4,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain('MathUtils: number too big to be packed');
    }
  });
});
