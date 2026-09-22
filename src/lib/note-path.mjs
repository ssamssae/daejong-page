// Files provide stable unique URLs; editorial slugs can repeat across dated notes.
export const noteSlug = entry => (entry.file?.trim() || entry.slug + '.md').replace(/\.md$/, '');
export const noteHref = (group, entry) => `/notes/${group}/${encodeURIComponent(noteSlug(entry))}/`;
