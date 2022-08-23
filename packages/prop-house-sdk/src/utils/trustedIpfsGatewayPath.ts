import { trustedIpfsGateway } from '../constants/';

export const trustedIpfsGatewayPath = (cid: string) =>
  `${trustedIpfsGateway}${cid}`;
