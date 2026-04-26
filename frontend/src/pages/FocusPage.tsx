import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { camiclockApi } from '../api/camiclockApi'
import type { Category, DashboardSummary } from '../types'
import { elapsedFrom, formatSeconds } from '../utils/time'

export const FocusPage = () => {
  const [periodType, setPeriodType] = useState<'day' | 'week'>('day')
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [running, setRunning] = useState<null | {
    id: number
    categoryId: number
    categoryName: string
    categoryColor: string
    startedAt: string
  }>(null)
  const [, setTick] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0)
  const [manualCategoryId, setManualCategoryId] = useState<number>(0)
  const [manualMinutes, setManualMinutes] = useState<number>(20)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const load = useCallback(async () => {
    const [sum, cats, run] = await Promise.all([
      camiclockApi.summary(periodType),
      camiclockApi.categories(),
      camiclockApi.timerRunning(),
    ])

    setSummary(sum)
    setCategories(cats)
    setRunning(run)

    if (cats.length > 0 && selectedCategoryId === 0) {
      setSelectedCategoryId(cats[0].id)
    }
    if (cats.length > 0 && manualCategoryId === 0) {
      setManualCategoryId(cats[0].id)
    }
  }, [periodType, selectedCategoryId, manualCategoryId])

  useEffect(() => {
    load().catch(() => null)
  }, [load])

  useEffect(() => {
    if (!running) {
      return
    }

    const id = window.setInterval(() => setTick((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth <= 900)
    }

    updateMobileState()
    window.addEventListener('resize', updateMobileState)

    return () => window.removeEventListener('resize', updateMobileState)
  }, [])

  const startTimer = async () => {
    if (!selectedCategoryId) return
    await camiclockApi.timerStart(selectedCategoryId)
    await load()
  }

  const stopTimer = async () => {
    await camiclockApi.timerStop()
    await load()
  }

  const addManualTime = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCategoryId || manualMinutes <= 0) {
      return
    }

    await camiclockApi.timerManual({
      categoryId: manualCategoryId,
      durationMinutes: manualMinutes,
    })

    await load()
  }

  const chartData = useMemo(
    () =>
      (summary?.categories ?? []).map((item) => ({
        name: item.name,
        spentHours: +(item.spentSeconds / 3600).toFixed(2),
        targetHours: +(item.targetSeconds / 3600).toFixed(2),
        color: item.color,
      })),
    [summary],
  )

  const mobilePieData = chartData.filter((entry) => entry.spentHours > 0)
  const totalProgressPercent =
    summary && summary.totalTargetSeconds > 0
      ? Math.min(100, Math.round((summary.totalSpentSeconds / summary.totalTargetSeconds) * 100))
      : 0

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
          <label className="select-wrap">
            <span>Категория фокуса</span>
            <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(Number(e.target.value))}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

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

        <form className="inline-form" onSubmit={addManualTime}>
          <label className="select-wrap">
            <span>Добавить вручную</span>
            <select value={manualCategoryId} onChange={(e) => setManualCategoryId(Number(e.target.value))}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="select-wrap">
            <span>Минут</span>
            <input
              type="number"
              min={1}
              max={1440}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(Number(e.target.value))}
            />
          </label>
          <button className="ghost-btn" type="submit">
            Добавить время
          </button>
        </form>
      </section>

      <motion.section className="card wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>{isMobile ? 'Распределение фокуса' : 'Сравнение факт/план'}</h2>
        <div className="chart-box">
          {isMobile ? (
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={mobilePieData}
                    dataKey="spentHours"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {mobilePieData.map((entry) => (
                      <Cell key={`mobile-spent-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center">
                <strong>{formatSeconds(summary?.totalSpentSeconds ?? 0)}</strong>
                <span>{totalProgressPercent}% к плану</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spentHours" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={`spent-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="targetHours" fill="#D8B4FE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {isMobile && (
          <ul className="plain-list">
            {mobilePieData.map((entry) => (
              <li key={`legend-${entry.name}`}>
                <span>
                  <em style={{ color: entry.color }}>{entry.name}</em>
                </span>
                <strong>{formatSeconds(Math.round(entry.spentHours * 3600))}</strong>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <section className="card wide">
        <h2>Последние сессии</h2>
        <ul className="plain-list">
          {(summary?.recentEntries ?? []).map((entry) => (
            <li key={entry.id}>
              <span>
                <em style={{ color: entry.categoryColor }}>{entry.categoryName}</em>
              </span>
              <strong>{formatSeconds(entry.durationSeconds)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
