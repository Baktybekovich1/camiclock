import { useEffect, useState } from 'react'
import { camiclockApi } from '../api/camiclockApi'
import type { Category } from '../types'
import { useSettings } from '../context/SettingsContext'

const text = {
  en: {
    title: 'Category Management',
    subtitle: 'Create time categories, pick colors, and edit them in one place.',
    newCategory: 'New category',
    color: 'Color',
    add: 'Add',
    changeColor: 'Change color',
    delete: 'Delete',
  },
  ru: {
    title: 'Управление категориями',
    subtitle: 'Создавайте категории времени, задавайте цвет и редактируйте их в одном месте.',
    newCategory: 'Новая категория',
    color: 'Цвет',
    add: 'Добавить',
    changeColor: 'Изменить цвет',
    delete: 'Удалить',
  },
} as const

export const CategoriesPage = () => {
  const { locale } = useSettings()
  const t = text[locale]
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
      <h2>{t.title}</h2>
      <p className="muted">{t.subtitle}</p>

      <form className="inline-form" onSubmit={createCategory}>
        <input
          value={newCategory.name}
          onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
          placeholder={t.newCategory}
        />
        <label className="color-control">
          <span>{t.color}</span>
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory((p) => ({ ...p, color: e.target.value.toUpperCase() }))}
          />
        </label>
        <button className="primary-btn" type="submit">
          {t.add}
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
                <span>{t.changeColor}</span>
                <input
                  type="color"
                  defaultValue={category.color}
                  onChange={(e) => updateCategory(category.id, { color: e.target.value.toUpperCase() }).catch(() => null)}
                />
              </label>
              <button className="ghost-btn" type="button" onClick={() => deleteCategory(category.id)}>
                {t.delete}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
