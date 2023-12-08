export enum ExternalURL {
  discord,
  twitter,
  github,
  offchain,
  gitbook,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'https://discord.com/invite/SKPzM8GHts';
    case ExternalURL.twitter:
      return 'https://twitter.com/nounsprophouse';
    case ExternalURL.github:
      return 'https://github.com/Prop-House';
    case ExternalURL.offchain:
      return 'https://offchain--prop-house.netlify.app';
    case ExternalURL.gitbook:
      return 'https://prop-house.gitbook.io/';
  }
};
