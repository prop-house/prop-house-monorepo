import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { SignedEntity } from './signed';
import { verifyMessage } from '@ethersproject/wallet';
import { Contract, providers, utils } from 'ethers';
import config from 'src/config/configuration';

const EIP1271_ABI = [
  'function isValidSignature(bytes32 _message, bytes _signature) public view returns (bytes4)',
];
const EIP1271_MAGICVALUE = '0x1626ba7e';

@Injectable()
export class SignedPayloadValidationPipe implements PipeTransform {
  private readonly _provider = new providers.JsonRpcProvider(config().JSONRPC);

  /**
   * Verifies a signed data payload has a valid EOA or EIP-1271 signature for `value.address`
   */
  async transform(value: SignedEntity, _metadata: ArgumentMetadata) {
    const message = Buffer.from(value.signedData.message, 'base64').toString();

    const { isValidAccountSig, accountSigError } = this.verifyAccountSignature(
      message,
      value,
    );
    if (isValidAccountSig) {
      return value;
    }

    // If the signer is not a contract, then we have an invalid EOA signature
    const code = await this._provider.getCode(value.address);
    if (code === '0x') {
      throw new Error(accountSigError);
    }

    // prettier-ignore
    const { isValidContractSig, contractSigError } =  await this.verifyContractSignature(message, value);
    if (isValidContractSig) {
      return value;
    }
    throw new Error(contractSigError);
  }

  /**
   * Verify the validity of an EOA signature
   * @param message The signed message
   * @param value The signed data payload
   */
  private verifyAccountSignature(message: string, value: SignedEntity) {
    let actualSigner: string | undefined;
    try {
      actualSigner = verifyMessage(message, value.signedData.signature);
    } catch (error) {
      return {
        isValidAccountSig: false,
        accountSigError: `EOA signature invalid. Error: ${error}`,
      };
    }

    if (actualSigner.toLowerCase() !== value.address.toLowerCase()) {
      return {
        isValidAccountSig: false,
        accountSigError: `Incorrect EOA signer. Actual: ${actualSigner}. Expected: ${value.address}.`,
      };
    }
    return {
      isValidAccountSig: true,
    };
  }

  /**
   * Verify the validity of a contract signature
   * @param message The signed message
   * @param value The signed data payload
   */
  private async verifyContractSignature(message: string, value: SignedEntity) {
    const contract = new Contract(value.address, EIP1271_ABI, this._provider);
    try {
      const res = await contract.isValidSignature(
        utils.hashMessage(message),
        value.signedData.signature,
      );
      const isValidContractSig = res === EIP1271_MAGICVALUE;
      // prettier-ignore
      return {
        isValidContractSig,
        ...(isValidContractSig ? {} : { contractSigError: `Invalid contract signature magic value: ${res}` }),
      };
    } catch (error) {
      return {
        isValidContractSig: false,
        contractSigError: `Contract signature invalid. Error: ${error}`,
      };
    }
  }
}
