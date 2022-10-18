export enum ExternalURL {
  discord,
  twitter,
  github,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.discord:
      return 'https://discord.com/invite/SKPzM8GHts';
    case ExternalURL.twitter:
      return 'https://twitter.com/nounsprophouse';
    case ExternalURL.github:
      return 'https://github.com/Prop-House';
  }
};
