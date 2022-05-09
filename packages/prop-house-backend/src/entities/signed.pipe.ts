
import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { SignedDataPayload, SignedEntity } from './signed';
import { verifyMessage } from "@ethersproject/wallet"

@Injectable()
export class SignedPayloadValidationPipe implements PipeTransform {
  /**
   * Verifies that a signed data payload has a valid signature and matches the address in the payload
   */
  transform(value: SignedEntity, metadata: ArgumentMetadata) {
	  const signedData: SignedDataPayload = value.signedData
    signedData.message = Buffer.from(signedData.message, "base64").toString();
    const recoveredAddress = verifyMessage(signedData.message, signedData.signature);
    if (recoveredAddress !== value.address) throw new HttpException("Signature or signed data payload invalid", HttpStatus.BAD_REQUEST);
    return value;
  }
}
