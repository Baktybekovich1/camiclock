import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { camiclockApi } from '../api/camiclockApi'
import type { Category, DashboardSummary, Plan } from '../types'
import { elapsedFrom, formatSeconds } from '../utils/time'

const palette = ['#8B5CF6', '#A855F7', '#C084FC', '#7E22CE', '#9333EA', '#B794F4']

export const DashboardPage = () => {
  const [periodType, setPeriodType] = useState<'day' | 'week'>('day')
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [running, setRunning] = useState<null | {
    id: number
    categoryId: number
    categoryName: string
    categoryColor: string
    startedAt: string
  }>(null)
  const [, setTick] = useState(0)

  const [newCategory, setNewCategory] = useState({ name: '', color: '#8B5CF6' })
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [planCategoryId, setPlanCategoryId] = useState<number>(0)
  const [planMinutes, setPlanMinutes] = useState(60)

  const loadAll = useCallback(async () => {
    const [sum, cats, planList, run] = await Promise.all([
      camiclockApi.summary(periodType),
      camiclockApi.categories(),
      camiclockApi.plans(periodType),
      camiclockApi.timerRunning(),
    ])

    setSummary(sum)
    setCategories(cats)
    setPlans(planList)
    setRunning(run)

    if (cats.length > 0 && selectedCategoryId === 0) {
      setSelectedCategoryId(cats[0].id)
      setPlanCategoryId(cats[0].id)
    }
  }, [periodType, selectedCategoryId])

  useEffect(() => {
    loadAll().catch(() => null)
  }, [loadAll])

  useEffect(() => {
    if (!running) {
      return
    }

    const id = window.setInterval(() => setTick((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      return
    }

    await camiclockApi.createCategory(newCategory)
    setNewCategory({ name: '', color: '#8B5CF6' })
    await loadAll()
  }

  const startTimer = async () => {
    if (!selectedCategoryId) return
    await camiclockApi.timerStart(selectedCategoryId)
    await loadAll()
  }

  const stopTimer = async () => {
    await camiclockApi.timerStop()
    await loadAll()
  }

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planCategoryId) return

    await camiclockApi.upsertPlan({
      categoryId: planCategoryId,
      periodType,
      targetMinutes: planMinutes,
    })

    await loadAll()
  }

  const chartData = useMemo(
    () =>
      (summary?.categories ?? []).map((item) => ({
        name: item.name,
        spentHours: +(item.spentSeconds / 3600).toFixed(2),
        targetHours: +(item.targetSeconds / 3600).toFixed(2),
      })),
    [summary],
  )

  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="inline-between">
          <h2>Фокус-панель</h2>
          <div className="toggle-wrap">
            <button className={periodType === 'day' ? 'toggle active' : 'toggle'} onClick={() => setPeriodType('day')}>
              День
            </button>
            <button className={periodType === 'week' ? 'toggle active' : 'toggle'} onClick={() => setPeriodType('week')}>
              Неделя
            </button>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi-card">
            <p>Потрачено</p>
            <strong>{formatSeconds(summary?.totalSpentSeconds ?? 0)}</strong>
          </div>
          <div className="kpi-card">
            <p>План</p>
            <strong>{formatSeconds(summary?.totalTargetSeconds ?? 0)}</strong>
          </div>
          <div className="kpi-card">
            <p>Разрыв</p>
            <strong>{formatSeconds(Math.max(0, summary?.totalGapSeconds ?? 0))}</strong>
          </div>
        </div>

        <div className="timer-panel">
          <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(Number(e.target.value))}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {!running ? (
            <button className="primary-btn" onClick={startTimer}>
              Старт таймера
            </button>
          ) : (
            <button className="danger-btn" onClick={stopTimer}>
              Стоп {elapsedFrom(running.startedAt)}
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Категории</h2>
        <form className="inline-form" onSubmit={createCategory}>
          <input
            value={newCategory.name}
            onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
            placeholder="Новая категория"
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory((p) => ({ ...p, color: e.target.value.toUpperCase() }))}
          />
          <button className="ghost-btn" type="submit">
            Добавить
          </button>
        </form>

        <div className="chips-wrap">
          {categories.map((category) => (
            <span key={category.id} className="chip" style={{ borderColor: category.color }}>
              <i style={{ background: category.color }} />
              {category.name}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>План по категории</h2>
        <form className="inline-form" onSubmit={savePlan}>
          <select value={planCategoryId} onChange={(e) => setPlanCategoryId(Number(e.target.value))}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input type="number" min={0} value={planMinutes} onChange={(e) => setPlanMinutes(Number(e.target.value))} />
          <span className="muted">минут</span>
          <button className="ghost-btn" type="submit">
            Сохранить
          </button>
        </form>

        <ul className="plain-list">
          {plans.map((plan) => (
            <li key={plan.id}>
              <span>{plan.categoryName}</span>
              <strong>{plan.targetMinutes} мин</strong>
            </li>
          ))}
        </ul>
      </section>

      <motion.section className="card wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Сравнение факт/план</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="spentHours" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="targetHours" fill="#D8B4FE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <section className="card wide">
        <h2>Последние сессии</h2>
        <ul className="plain-list">
          {(summary?.recentEntries ?? []).map((entry, index) => (
            <li key={entry.id}>
              <span>
                <em style={{ color: palette[index % palette.length] }}>{entry.categoryName}</em>
              </span>
              <strong>{formatSeconds(entry.durationSeconds)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
