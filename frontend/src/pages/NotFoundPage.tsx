import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: { title: 'Page not found', back: 'Go home' },
  ru: { title: 'Страница не найдена', back: 'На главную' },
} as const

export const NotFoundPage = () => {
  const { locale } = useSettings()
  const t = text[locale]

  return (
    <section className="card narrow center-card">
      <h2>{t.title}</h2>
      <Link to="/" className="primary-btn link-btn">
        {t.back}
      </Link>
    </section>
  )
}
