import { PipeTransform, Injectable } from '@nestjs/common';
import { SignatureState } from 'src/types/signature';
import { verifyAccountSignature } from 'src/utils';
import { SignedEntity } from './signed';

@Injectable()
export class ECDSASignedPayloadValidationPipe implements PipeTransform {
  /**
   * Verifies that a signed data payload has a valid signature and matches the address in the payload
   */
  async transform(value: SignedEntity) {
    const message = Buffer.from(value.signedData.message, 'base64').toString();

    const { isValidAccountSig, accountSigError } = verifyAccountSignature(
      message,
      value,
    );
    if (!isValidAccountSig) {
      throw new Error(accountSigError);
    }
    return {
      ...value,
      signatureState: SignatureState.VALIDATED,
    };
  }
}
