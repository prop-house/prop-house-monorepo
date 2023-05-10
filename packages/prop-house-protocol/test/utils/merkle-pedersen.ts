import { hash } from 'starknet';

export class MerklePedersen {
  public root: string;

  constructor(values: string[]) {
    this.root = MerklePedersen.generateMerkleRoot(values);
  }

  public getProof(values: string[], index: number): string[] {
    return MerklePedersen.getProofHelper(values, index, []);
  }

  public static generateMerkleRoot(values: string[]): string {
    if (values.length == 1) {
      return values[0];
    }
    if (values.length % 2 != 0) {
      values.push('0x0');
    }
    const nextLevel = MerklePedersen.getNextLevel(values);
    return MerklePedersen.generateMerkleRoot(nextLevel);
  }

  public static getNextLevel(level: string[]): string[] {
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      let node = '0x0';
      if (BigInt(level[i]) < BigInt(level[i + 1])) {
        node = hash.pedersen([level[i], level[i + 1]]);
      } else {
        node = hash.pedersen([level[i + 1], level[i]]);
      }
      nextLevel.push(node);
    }
    return nextLevel;
  }

  public static getProofHelper(level: string[], index: number, proof: string[]): string[] {
    if (level.length == 1) {
      return proof;
    }
    if (level.length % 2 != 0) {
      level.push('0x0');
    }
    const nextLevel = MerklePedersen.getNextLevel(level);
    let indexParent = 0;

    for (let i = 0; i < level.length; i++) {
      if (i == index) {
        indexParent = Math.floor(i / 2);
        if (i % 2 == 0) {
          proof.push(level[index + 1]);
        } else {
          proof.push(level[index - 1]);
        }
      }
    }
    return MerklePedersen.getProofHelper(nextLevel, indexParent, proof);
  }
}
