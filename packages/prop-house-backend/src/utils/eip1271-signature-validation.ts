import { SignedEntity } from 'src/entities/signed';
import { Contract, providers, utils } from 'ethers';

const EIP1271_ABI = [
  'function isValidSignature(bytes32 _message, bytes _signature) public view returns (bytes4)',
];
const EIP1271_MAGICVALUE = '0x1626ba7e';

/**
 * Verify the validity of a contract signature
 * @param message The signed message
 * @param value The signed data payload
 * @param provider A JSON RPC provider
 */
export const verifyContractSignature = async (
  message: string,
  value: SignedEntity,
  provider: providers.JsonRpcProvider,
) => {
  const contract = new Contract(value.address, EIP1271_ABI, provider);
  try {
    const res = await contract.isValidSignature(
      utils.hashMessage(message),
      value.signedData.signature || '0x',
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
};
