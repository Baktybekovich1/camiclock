import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <section className="card narrow center-card">
      <h2>Страница не найдена</h2>
      <Link to="/" className="primary-btn link-btn">
        На главную
      </Link>
    </section>
  )
}
