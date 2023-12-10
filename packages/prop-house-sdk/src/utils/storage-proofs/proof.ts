import { IntsSequence } from '../ints-sequence';
import { hexToBytes } from '../bytes';
import { encoding } from '../..';

export interface ProofInputs {
  blockNumber: number;
  accountProofSubArrayLength: number;
  accountProof: string[];
  storageProofSubArrayLength: number;
  storageProof: string[];
}

export interface StorageProof {
  key: string;
  proof: string[];
}

export interface Proofs {
  address: string;
  accountProof: string[];
  storageProof: StorageProof[];
}

/**
 * Produces the input data for the account and storage proof verification methods in Herodotus
 * @param blockNumber Block Number that the proof targets
 * @param proofs Proofs object from RPC call
 * @returns ProofInputs object
 */
export const getProofInputs = (
  blockNumber: number,
  proofs: Proofs,
): ProofInputs => {
  const accountProofArray = proofs.accountProof.map((node: string) =>
    IntsSequence.fromBytes(hexToBytes(node)),
  );
  let accountProof: string[] = [];
  for (const node of accountProofArray) {
    accountProof = accountProof.concat(
      `0x${node.values.length.toString(16)}`, ...encoding.reverseByteOrder(node.values)
    );
  }
  
  if (proofs.storageProof.length > 1) {
    throw new Error('Multiple storage proofs not yet supported');
  }
  const storageProofArray = proofs.storageProof[0].proof.map((node: string) =>
    IntsSequence.fromBytes(hexToBytes(node)),
  );
  let storageProof: string[] = [];
  for (const node of storageProofArray) {
    storageProof = storageProof.concat(
      `0x${node.values.length.toString(16)}`, ...encoding.reverseByteOrder(node.values)
    );
  }

  return {
    blockNumber,
    accountProofSubArrayLength: accountProofArray.length,
    accountProof,
    storageProofSubArrayLength: storageProofArray.length,
    storageProof,
  };
};
