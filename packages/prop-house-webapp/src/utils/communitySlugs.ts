import slugify from 'slugify';

export const nameToSlug = (name: string) => slugify(name, { lower: true, strict: true });

export const slugToName = (slug: string) => slug.replaceAll('-', ' ');
