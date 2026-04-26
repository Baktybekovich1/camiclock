import { useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { Category } from '../types'

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '#8B5CF6' })

  const load = () => {
    camiclockApi.categories().then(setCategories)
  }

  useEffect(() => {
    load()
  }, [])

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    await camiclockApi.createCategory(newCategory)
    setNewCategory({ name: '', color: '#8B5CF6' })
    load()
  }

  const updateCategory = async (id: number, patch: { name?: string; color?: string }) => {
    await camiclockApi.updateCategory(id, patch)
    load()
  }

  const deleteCategory = async (id: number) => {
    await camiclockApi.deleteCategory(id)
    load()
  }

  return (
    <section className="card">
      <h2>Управление категориями</h2>
      <p className="muted">Создавайте категории времени, задавайте цвет и редактируйте их в одном месте.</p>

      <form className="inline-form" onSubmit={createCategory}>
        <input
          value={newCategory.name}
          onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
          placeholder="Новая категория"
        />
        <label className="color-control">
          <span>Цвет</span>
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory((p) => ({ ...p, color: e.target.value.toUpperCase() }))}
          />
        </label>
        <button className="primary-btn" type="submit">
          Добавить
        </button>
      </form>

      <div className="category-grid">
        {categories.map((category) => (
          <article key={category.id} className="category-card">
            <div className="inline-between">
              <strong>{category.name}</strong>
              <span className="chip" style={{ borderColor: category.color }}>
                <i style={{ background: category.color }} />
                {category.color}
              </span>
            </div>

            <div className="inline-form">
              <input
                defaultValue={category.name}
                onBlur={(e) => {
                  const value = e.target.value.trim()
                  if (value && value !== category.name) {
                    updateCategory(category.id, { name: value }).catch(() => null)
                  }
                }}
              />
              <label className="color-control">
                <span>Изменить цвет</span>
                <input
                  type="color"
                  defaultValue={category.color}
                  onChange={(e) => updateCategory(category.id, { color: e.target.value.toUpperCase() }).catch(() => null)}
                />
              </label>
              <button className="ghost-btn" type="button" onClick={() => deleteCategory(category.id)}>
                Удалить
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
