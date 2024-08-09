export function getPluralEnding(array: any[], esEnding: boolean = false): string {
  const ending = esEnding ? 'es' : 's'
  return array.length === 1 ? '' : ending
}
