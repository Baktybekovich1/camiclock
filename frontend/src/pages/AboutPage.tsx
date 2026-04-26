import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { camiclockApi } from '../api/camiclockApi'

const chaosData = [
  { day: 'Пн', value: 42 },
  { day: 'Вт', value: 38 },
  { day: 'Ср', value: 47 },
  { day: 'Чт', value: 33 },
  { day: 'Пт', value: 51 },
  { day: 'Сб', value: 29 },
  { day: 'Вс', value: 45 },
]

const resultData = [
  { name: 'Осознанная работа', value: 48, fill: '#8B5CF6' },
  { name: 'Развитие и хобби', value: 27, fill: '#A855F7' },
  { name: 'Рутина', value: 25, fill: '#DDD6FE' },
]

export const AboutPage = () => {
  const [description, setDescription] = useState('Планируй день и неделю, запускай таймер по категориям и отслеживай прогресс без перегруза.')

  useEffect(() => {
    camiclockApi
      .about()
      .then((res) => setDescription(res.description))
      .catch(() => null)
  }, [])

  return (
    <div className="grid-one">
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="hero-card"
      >
        <p className="tag">Time Startup</p>
        <h1>CamiClock: контроль времени без выгорания</h1>
        <p>{description}</p>
      </motion.section>

      <section className="promo-grid">
        <article
          className="promo-card photo"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80')" }}
        >
          <div className="overlay">
            <h3>Проблема</h3>
            <p>Люди теряют фокус и не понимают, куда уходит время каждый день.</p>
          </div>
        </article>

        <article
          className="promo-card photo"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80')" }}
        >
          <div className="overlay">
            <h3>Решение</h3>
            <p>Категории + таймер + планы на день и неделю + аналитика по факту.</p>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <h2>Как выглядит хаос</h2>
          <p className="muted">До CamiClock нет прозрачности, и нагрузка скачет по дням.</p>
          <div className="chart-box small">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chaosData}>
                <defs>
                  <linearGradient id="chaos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C084FC" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#C084FC" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#chaos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h2>После внедрения</h2>
          <p className="muted">Пользователь видит баланс времени и управляет приоритетами.</p>
          <div className="chart-box small">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={resultData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card">
        <h2>Как CamiClock решает задачу</h2>
        <div className="value-grid">
          <article>
            <h3>1. Ясность</h3>
            <p>Показывает сколько реально потрачено, сколько запланировано и где не дотянули.</p>
          </article>
          <article>
            <h3>2. Дисциплина</h3>
            <p>Таймер в один клик фиксирует сессии и формирует честную картину продуктивности.</p>
          </article>
          <article>
            <h3>3. Рост</h3>
            <p>Еженедельные планы по категориям помогают развивать привычки и не терять фокус.</p>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="inline-between">
          <h2>Тарифы и Roadmap</h2>
          <span className="chip" style={{ borderColor: '#A855F7' }}>
            <i style={{ background: '#A855F7' }} />
            2026
          </span>
        </div>

        <div className="pricing-grid">
          <article className="price-card">
            <p className="muted">Starter</p>
            <h3>Бесплатно</h3>
            <ul className="plain-list compact">
              <li>До 8 категорий</li>
              <li>Таймер и дневные планы</li>
              <li>Базовая аналитика</li>
            </ul>
          </article>

          <article className="price-card featured">
            <p className="muted">Pro</p>
            <h3>$7 / мес</h3>
            <ul className="plain-list compact">
              <li>Безлимит категорий</li>
              <li>Недельные цели и отчеты</li>
              <li>Напоминания и экспорт</li>
            </ul>
          </article>

          <article className="price-card">
            <p className="muted">Team</p>
            <h3>$19 / мес</h3>
            <ul className="plain-list compact">
              <li>Командные дашборды</li>
              <li>Роли и управление участниками</li>
              <li>Еженедельные email-дайджесты</li>
            </ul>
          </article>
        </div>

        <div className="roadmap-line">
          <div>
            <strong>Q2 2026</strong>
            <p>Мобильная PWA и офлайн-режим</p>
          </div>
          <div>
            <strong>Q3 2026</strong>
            <p>AI-рекомендации по перераспределению времени</p>
          </div>
          <div>
            <strong>Q4 2026</strong>
            <p>Интеграции с календарями и трекерами привычек</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Отзывы пользователей</h2>
        <div className="reviews-grid">
          <blockquote>
            <p>«За 3 недели сократил время в соцсетях и наконец стабильно читаю по 40 минут в день.»</p>
            <cite>Айбек, product designer</cite>
          </blockquote>
          <blockquote>
            <p>«До CamiClock день казался хаосом. Теперь вижу план и факт в разрезе каждой категории.»</p>
            <cite>Нурия, студент</cite>
          </blockquote>
          <blockquote>
            <p>«Команде стало проще обсуждать фокус недели. Метрики понятные, без лишней сложности.»</p>
            <cite>Дамир, founder</cite>
          </blockquote>
        </div>
      </section>

      <motion.section
        className="cta-card"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <p className="tag">Start Now</p>
          <h2>Начните первую фокус-сессию уже сегодня</h2>
          <p className="muted">Создайте категорию, запустите таймер и получите первую честную метрику вашего дня.</p>
          <a className="primary-btn link-btn" href="/register">
            Создать аккаунт
          </a>
        </div>

        <motion.div className="timer-demo" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
          <p className="muted">Сейчас в фокусе</p>
          <strong>Чтение книги</strong>
          <motion.div className="demo-time" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            00:24:18
          </motion.div>
          <div className="progress-track">
            <motion.span className="progress-fill" initial={{ width: '30%' }} animate={{ width: ['30%', '72%', '55%'] }} transition={{ repeat: Infinity, duration: 3.4 }} />
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
