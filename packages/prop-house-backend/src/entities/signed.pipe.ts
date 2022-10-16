import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SignedDataPayload, SignedEntity } from './signed';
import { verifyMessage } from '@ethersproject/wallet';

@Injectable()
export class SignedPayloadValidationPipe implements PipeTransform {
  /**
   * Verifies that a signed data payload has a valid signature and matches the address in the payload
   */
  transform(value: SignedEntity, metadata: ArgumentMetadata) {
    const signedData: SignedDataPayload = value.signedData;
    const message = Buffer.from(signedData.message, 'base64').toString();

    let actualSigner;
    try {
      actualSigner = verifyMessage(message, signedData.signature);
    } catch (e) {
      throw new Error(`Signature invalid. Error: ${e}`);
    }

    if (actualSigner.toLowerCase() !== value.address.toLowerCase()) {
      throw new Error(
        `Incorrect Signer. Actual: ${actualSigner}. Expected: ${value.address}.`,
      );
    }
    return value;
  }
}
