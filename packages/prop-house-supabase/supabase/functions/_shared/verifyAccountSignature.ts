import { verifyTypedData } from 'https://esm.sh/@ethersproject/wallet';

/**
 * Verify the validity of an EOA signature
 * @param message The signed message
 * @param value The signed data payload
 */
export const verifyAccountSignature = (message: string, value: Record<string, any>) => {
  let actualSigner: string | undefined;

  const payload = JSON.parse(message);

  try {
    actualSigner = verifyTypedData(
      value.domainSeparator,
      value.messageTypes,
      payload,
      value.signedData.signature,
    );
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
