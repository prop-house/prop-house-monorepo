import { defaultAbiCoder } from '@ethersproject/abi';
import { FundingHouseConfig } from '../../types';
import { FUNDING_HOUSE_CONFIG_STRUCT_TYPE } from './constants';

/**
 * Determine if the passed `uri` is valid
 * @param uri The URI
 */
const isValidURI = (uri: string) => {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
};

/**
 * ABI-encode the funding house configuration
 * @param config The funding house config
 */
export const encodeFundingHouseConfig = (config: FundingHouseConfig): string => {
  if (!isValidURI(config.contractURI)) {
    throw new Error(`Invalid contract URI: ${config.contractURI}`);
  }
  return defaultAbiCoder.encode([FUNDING_HOUSE_CONFIG_STRUCT_TYPE], [config.contractURI]);
};
