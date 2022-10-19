import { PipeTransform, Injectable } from '@nestjs/common';
import { SignedEntity } from './signed';
import { providers } from 'ethers';
import config from 'src/config/configuration';
import { SignatureState } from 'src/types/signature';
import { verifyAccountSignature, verifyContractSignature } from 'src/utils';

@Injectable()
export class SignedPayloadValidationPipe implements PipeTransform {
  private readonly _provider = new providers.JsonRpcProvider(config().JSONRPC);

  /**
   * Verifies a signed data payload has a valid EOA or EIP-1271 signature for `value.address`
   */
  async transform(value: SignedEntity) {
    const message = Buffer.from(value.signedData.message, 'base64').toString();

    const { isValidAccountSig, accountSigError } = verifyAccountSignature(
      message,
      value,
    );
    if (isValidAccountSig) {
      return {
        ...value,
        signatureState: SignatureState.VALIDATED,
      };
    }

    // If the signer is not a contract, then we have an invalid EOA signature
    const code = await this._provider.getCode(value.address);
    if (code === '0x') {
      throw new Error(accountSigError);
    }

    // prettier-ignore
    const { isValidContractSig } =  await verifyContractSignature(message, value, this._provider);
    if (isValidContractSig) {
      return {
        ...value,
        signatureState: SignatureState.VALIDATED,
      };
    }
    // If the contract signature is not valid, mark it as pending validation
    return {
      ...value,
      signatureState: SignatureState.PENDING_VALIDATION,
    };
  }
}
