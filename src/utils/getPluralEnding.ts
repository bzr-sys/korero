export function getPluralEnding(array: unknown[], esEnding: boolean = false): string {
  const ending = esEnding ? 'es' : 's'
  return array.length === 1 ? '' : ending
}
