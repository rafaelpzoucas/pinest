export function formatSlug(slug: string) {
  return slug
    .replace(/-/g, ' ') // troca - por espaço
    .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize
}
