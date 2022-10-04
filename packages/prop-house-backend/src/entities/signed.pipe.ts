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
    try {
      verifyMessage(message, signedData.signature);
    } catch (e) {
      throw new HttpException('Signature invalid', HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
