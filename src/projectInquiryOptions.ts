export const PROJECT_BUDGET_OPTIONS = [
  'Under $500',
  '$500–$1,000',
  '$1,000–$2,500',
  '$2,500–$5,000',
  '$5,000+',
  'I need help estimating',
] as const

export type ProjectBudget = (typeof PROJECT_BUDGET_OPTIONS)[number]

export function parseProjectBudget(value: string): ProjectBudget | '' {
  return PROJECT_BUDGET_OPTIONS.includes(value as ProjectBudget)
    ? value as ProjectBudget
    : ''
}
