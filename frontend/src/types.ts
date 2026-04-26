export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
  roles: string[]
  isActive: boolean
  createdAt: string
}

export type Category = {
  id: number
  name: string
  color: string
  isDefault: boolean
}

export type TimerEntry = {
  id: number
  category: {
    id: number
    name: string
    color: string
  }
  startedAt: string
  endedAt: string | null
  durationSeconds: number
}

export type Plan = {
  id: number
  categoryId: number
  categoryName: string
  categoryColor: string
  periodType: 'day' | 'week'
  periodStart: string
  targetMinutes: number
}

export type DashboardSummary = {
  periodType: 'day' | 'week'
  periodStart: string
  totalSpentSeconds: number
  totalTargetSeconds: number
  totalGapSeconds: number
  categories: Array<{
    categoryId: number
    name: string
    color: string
    spentSeconds: number
    targetSeconds: number
    gapSeconds: number
    progressPercent: number
  }>
  recentEntries: Array<{
    id: number
    categoryName: string
    categoryColor: string
    durationSeconds: number
    startedAt: string
  }>
}
