import { verifyMessage } from '@ethersproject/wallet';
import { SignedEntity } from 'src/entities/signed';

/**
 * Verify the validity of an EOA signature
 * @param message The signed message
 * @param value The signed data payload
 */
export const verifyAccountSignature = (
  message: string,
  value: SignedEntity,
) => {
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
};
