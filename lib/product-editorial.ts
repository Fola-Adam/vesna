export const SELECTION_BASES = {
  not_recorded: 'Not recorded',
  researched: 'Researched',
  personally_used: 'Personally used by the curator',
  design: 'Selected for design',
} as const

export type SelectionBasis = keyof typeof SELECTION_BASES

export function specificationRows(value: string | null | undefined) {
  return (value ?? '').split('\n').filter(line => line.trim()).map(line => {
    const colon = line.indexOf(':')
    return { label: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() }
  }).filter(row => row.label && row.value)
}

export function validSpecifications(value: string) {
  const lines = value.split('\n').filter(line => line.trim())
  return lines.length <= 20 && lines.every(line => {
    const colon = line.indexOf(':')
    return colon > 0 && line.slice(0, colon).trim().length <= 80 &&
      line.slice(colon + 1).trim().length > 0 && line.slice(colon + 1).trim().length <= 300
  })
}
