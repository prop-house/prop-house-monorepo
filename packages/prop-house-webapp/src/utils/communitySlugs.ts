export const nameToSlug = (name: string) =>
  name.replaceAll(':', '').replaceAll(' ', '-').toLowerCase();

export const slugToName = (slug: string) => slug.replaceAll('-', ' ');
