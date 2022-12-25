export const nameToSlug = (name: string) => name.replaceAll(' ', '-').toLowerCase();

export const slugToName = (slug: string) => slug.replaceAll('-', ' ');
