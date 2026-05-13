import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { camiclockApi } from '../api/camiclockApi'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    fallbackDescription: 'Plan your day and week, run category timers, and track progress without overload.',
    tag: 'Time Startup',
    heroTitle: 'BloomB: time control without burnout',
    problem: 'Problem',
    problemText: 'People lose focus and do not understand where their time goes every day.',
    solution: 'Solution',
    solutionText: 'Categories + timer + daily and weekly plans + real analytics.',
    chaosTitle: 'What chaos looks like',
    chaosText: 'Before BloomB there is no transparency, and workload jumps from day to day.',
    afterTitle: 'After adoption',
    afterText: 'Users see time balance and manage priorities.',
    valueTitle: 'How BloomB solves it',
    clarity: 'Clarity',
    clarityText: 'Shows real spent time, planned time, and gaps by category.',
    discipline: 'Discipline',
    disciplineText: 'One-click timer tracks sessions and builds an honest productivity picture.',
    growth: 'Growth',
    growthText: 'Weekly category plans help build habits and protect focus.',
    pricingTitle: 'Pricing and Roadmap',
    free: 'Free',
    reviewsTitle: 'User reviews',
    ctaTag: 'Start Now',
    ctaTitle: 'Start your first focus session today',
    ctaText: 'Create a category, run the timer, and get your first honest metric for the day.',
    createAccount: 'Create account',
    inFocus: 'Now in focus',
    readingBook: 'Reading a book',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
    mindfulWork: 'Mindful work',
    growthHobby: 'Growth & hobbies',
    routine: 'Routine',
  },
  ru: {
    fallbackDescription: 'Планируй день и неделю, запускай таймер по категориям и отслеживай прогресс без перегруза.',
    tag: 'Time Startup',
    heroTitle: 'BloomB: контроль времени без выгорания',
    problem: 'Проблема',
    problemText: 'Люди теряют фокус и не понимают, куда уходит время каждый день.',
    solution: 'Решение',
    solutionText: 'Категории + таймер + планы на день и неделю + аналитика по факту.',
    chaosTitle: 'Как выглядит хаос',
    chaosText: 'До BloomB нет прозрачности, и нагрузка скачет по дням.',
    afterTitle: 'После внедрения',
    afterText: 'Пользователь видит баланс времени и управляет приоритетами.',
    valueTitle: 'Как BloomB решает задачу',
    clarity: 'Ясность',
    clarityText: 'Показывает сколько реально потрачено, сколько запланировано и где не дотянули.',
    discipline: 'Дисциплина',
    disciplineText: 'Таймер в один клик фиксирует сессии и формирует честную картину продуктивности.',
    growth: 'Рост',
    growthText: 'Еженедельные планы по категориям помогают развивать привычки и не терять фокус.',
    pricingTitle: 'Тарифы и Roadmap',
    free: 'Бесплатно',
    reviewsTitle: 'Отзывы пользователей',
    ctaTag: 'Start Now',
    ctaTitle: 'Начните первую фокус-сессию уже сегодня',
    ctaText: 'Создайте категорию, запустите таймер и получите первую честную метрику вашего дня.',
    createAccount: 'Создать аккаунт',
    inFocus: 'Сейчас в фокусе',
    readingBook: 'Чтение книги',
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
    mindfulWork: 'Осознанная работа',
    growthHobby: 'Развитие и хобби',
    routine: 'Рутина',
  },
} as const

export const AboutPage = () => {
  const { locale } = useSettings()
  const t = text[locale]
  const [description, setDescription] = useState(t.fallbackDescription)

  useEffect(() => {
    setDescription(t.fallbackDescription)
  }, [t.fallbackDescription])

  useEffect(() => {
    camiclockApi
      .about()
      .then((res) => setDescription(res.description))
      .catch(() => null)
  }, [])

  const chaosData = useMemo(
    () => [
      { day: t.mon, value: 42 },
      { day: t.tue, value: 38 },
      { day: t.wed, value: 47 },
      { day: t.thu, value: 33 },
      { day: t.fri, value: 51 },
      { day: t.sat, value: 29 },
      { day: t.sun, value: 45 },
    ],
    [t],
  )

  const resultData = useMemo(
    () => [
      { name: t.mindfulWork, value: 48, fill: '#8B5CF6' },
      { name: t.growthHobby, value: 27, fill: '#A855F7' },
      { name: t.routine, value: 25, fill: '#DDD6FE' },
    ],
    [t],
  )

  return (
    <div className="grid-one">
      <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="hero-card">
        <p className="tag">{t.tag}</p>
        <h1>{t.heroTitle}</h1>
        <p>{description}</p>
      </motion.section>

      <section className="promo-grid">
        <article className="promo-card photo" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80')" }}>
          <div className="overlay">
            <h3>{t.problem}</h3>
            <p>{t.problemText}</p>
          </div>
        </article>
        <article className="promo-card photo" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80')" }}>
          <div className="overlay">
            <h3>{t.solution}</h3>
            <p>{t.solutionText}</p>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>{t.chaosTitle}</h2>
          <p className="muted">{t.chaosText}</p>
          <div className="chart-box small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chaosData}><defs><linearGradient id="chaos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C084FC" stopOpacity={0.8} /><stop offset="95%" stopColor="#C084FC" stopOpacity={0.05} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" /><Tooltip /><Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#chaos)" /></AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h2>{t.afterTitle}</h2>
          <p className="muted">{t.afterText}</p>
          <div className="chart-box small">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart><Pie data={resultData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} /><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card">
        <h2>{t.valueTitle}</h2>
        <div className="value-grid">
          <article><h3>1. {t.clarity}</h3><p>{t.clarityText}</p></article>
          <article><h3>2. {t.discipline}</h3><p>{t.disciplineText}</p></article>
          <article><h3>3. {t.growth}</h3><p>{t.growthText}</p></article>
        </div>
      </section>

      <section className="card">
        <div className="inline-between"><h2>{t.pricingTitle}</h2><span className="chip" style={{ borderColor: '#A855F7' }}><i style={{ background: '#A855F7' }} />2026</span></div>
        <div className="pricing-grid">
          <article className="price-card"><p className="muted">Starter</p><h3>{t.free}</h3></article>
          <article className="price-card featured"><p className="muted">Pro</p><h3>$7 / mo</h3></article>
          <article className="price-card"><p className="muted">Team</p><h3>$19 / mo</h3></article>
        </div>
      </section>

      <section className="card">
        <h2>{t.reviewsTitle}</h2>
        <div className="reviews-grid">
          <blockquote><p>{locale === 'ru' ? '«За 3 недели сократил время в соцсетях и наконец стабильно читаю по 40 минут в день.»' : '"In 3 weeks I cut social media time and now read 40 minutes daily."'}</p></blockquote>
          <blockquote><p>{locale === 'ru' ? '«До BloomB день казался хаосом. Теперь вижу план и факт по каждой категории.»' : '"Before BloomB my day felt chaotic. Now I see plan vs actual by category."'}</p></blockquote>
          <blockquote><p>{locale === 'ru' ? '«Команде стало проще обсуждать фокус недели. Метрики понятные, без лишней сложности.»' : '"It became easier for the team to align on weekly focus. Clear metrics, no clutter."'}</p></blockquote>
        </div>
      </section>

      <motion.section className="cta-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
        <div>
          <p className="tag">{t.ctaTag}</p>
          <h2>{t.ctaTitle}</h2>
          <p className="muted">{t.ctaText}</p>
          <a className="primary-btn link-btn" href="/register">{t.createAccount}</a>
        </div>

        <motion.div className="timer-demo" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
          <p className="muted">{t.inFocus}</p>
          <strong>{t.readingBook}</strong>
          <motion.div className="demo-time" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.8 }}>00:24:18</motion.div>
          <div className="progress-track"><motion.span className="progress-fill" initial={{ width: '30%' }} animate={{ width: ['30%', '72%', '55%'] }} transition={{ repeat: Infinity, duration: 3.4 }} /></div>
        </motion.div>
      </motion.section>
    </div>
  )
}
