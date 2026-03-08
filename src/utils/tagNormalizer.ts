export const normalizeTag = (tag: string): string => {
  return tag.trim().toLowerCase();
};

export const normalizeTags = (tags: string[]): string[] => {
  const normalized = tags.map(normalizeTag);
  return Array.from(new Set(normalized));
};
