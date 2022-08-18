import { StarknetContract } from 'hardhat/types/runtime';
import { expect } from 'chai';
import { starknet } from 'hardhat';

describe('Starknet', () => {
  let example: StarknetContract;

  before(async () => {
    const factory = await starknet.getContractFactory('example');
    example = await factory.deploy();
  });

  it('should decode an event', async () => {
    const txHash = await example.invoke('emit_example_event');
    const receipt = await starknet.getTransactionReceipt(txHash);
    const events = await example.decodeEvents(receipt.events);

    expect(events).to.deep.equal([
      {
        name: 'example_event',
        data: { example_data: 42n },
      },
    ]);
  });
});
