export interface Propose {
  auth_strategy: string;
  house_strategy: string;
  author: string;
  metadata_uri: string;
  salt: string;
}

export interface Vote {
  auth_strategy: string;
  house_strategy: string;
  voter: string;
  proposal_votes_hash: string;
  strategies_hash: string;
  strategies_params_hash: string;
  salt: string;
}
