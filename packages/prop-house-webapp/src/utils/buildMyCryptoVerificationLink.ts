/**
 * Builds URL to verify message via MyCrypto verification.
 * Note: message should be decoded (ie not base64 encoded)
 */
export const buildMyCryptoVerificationLink = (
  address: string,
  message: string,
  signature: string,
) =>
  `https://app.mycrypto.com/verify-message?address=${address}&message=${message}&signature=${signature}`;
