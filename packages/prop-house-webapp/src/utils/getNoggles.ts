export type NamedGlassesSeed = GlassesParts & { background: GlassesBgColors };

export type GlassesSeed = { [T in keyof NamedGlassesSeed]: number };
export type RLEGlassesSeed = { [T in keyof NamedGlassesSeed]: number | string };

export type GlassesBgColors = '#transparent';
export type GlassesParts = {
  glasses: GlassesPart;
};

export type GlassesPart =
  | 'glasses-black-eyes-red'
  | 'glasses-black-rgb'
  | 'glasses-black'
  | 'glasses-blue-med-saturated'
  | 'glasses-blue'
  | 'glasses-deep-teal'
  | 'glasses-frog-green'
  | 'glasses-fullblack'
  | 'glasses-grass'
  | 'glasses-green-blue-multi'
  | 'glasses-grey'
  | 'glasses-guava'
  | 'glasses-hip-rose'
  | 'glasses-honey'
  | 'glasses-magenta'
  | 'glasses-orange'
  | 'glasses-pink-purple-multi'
  | 'glasses-red'
  | 'glasses-smoke'
  | 'glasses-teal'
  | 'glasses-watermelon'
  | 'glasses-yellow-orange-multi'
  | 'glasses-yellow';
