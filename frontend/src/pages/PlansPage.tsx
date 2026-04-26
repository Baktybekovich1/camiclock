import { useCallback, useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { Category, DashboardSummary, Plan } from '../types'
import { formatSeconds } from '../utils/time'

export const PlansPage = () => {
  const [periodType, setPeriodType] = useState<'day' | 'week'>('day')
  const [plans, setPlans] = useState<Plan[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [planCategoryId, setPlanCategoryId] = useState<number>(0)
  const [planMinutes, setPlanMinutes] = useState(60)

  const load = useCallback(async () => {
    const [planList, cats, sum] = await Promise.all([
      camiclockApi.plans(periodType),
      camiclockApi.categories(),
      camiclockApi.summary(periodType),
    ])

    setPlans(planList)
    setCategories(cats)
    setSummary(sum)

    if (cats.length > 0 && planCategoryId === 0) {
      setPlanCategoryId(cats[0].id)
    }
  }, [periodType, planCategoryId])

  useEffect(() => {
    load().catch(() => null)
  }, [load])

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planCategoryId) return

    await camiclockApi.upsertPlan({
      categoryId: planCategoryId,
      periodType,
      targetMinutes: planMinutes,
    })

    await load()
  }

  const removePlan = async (id: number) => {
    await camiclockApi.deletePlan(id)
    await load()
  }

  return (
    <section className="card">
      <div className="inline-between">
        <h2>Планы по категориям</h2>
        <div className="toggle-wrap">
          <button className={periodType === 'day' ? 'toggle active' : 'toggle'} onClick={() => setPeriodType('day')}>
            День
          </button>
          <button className={periodType === 'week' ? 'toggle active' : 'toggle'} onClick={() => setPeriodType('week')}>
            Неделя
          </button>
        </div>
      </div>

      <form className="inline-form" onSubmit={savePlan}>
        <label className="select-wrap">
          <span>Категория</span>
          <select value={planCategoryId} onChange={(e) => setPlanCategoryId(Number(e.target.value))}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <input type="number" min={0} value={planMinutes} onChange={(e) => setPlanMinutes(Number(e.target.value))} />
        <span className="muted">минут</span>
        <button className="primary-btn" type="submit">
          Сохранить план
        </button>
      </form>

      <ul className="plain-list">
        {plans.map((plan) => {
          const progress = summary?.categories.find((c) => c.categoryId === plan.categoryId)

          return (
            <li key={plan.id}>
              <div>
                <strong>{plan.categoryName}</strong>
                <p className="muted mini">Факт: {formatSeconds(progress?.spentSeconds ?? 0)}</p>
              </div>
              <div className="inline-form">
                <strong>{plan.targetMinutes} мин</strong>
                <button className="ghost-btn" type="button" onClick={() => removePlan(plan.id)}>
                  Удалить
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
