import { useEffect, useState } from 'react';
import type { Ingredient } from '../../api/adminApi';
import { getAllIngredients, deleteIngredient } from '../../api/adminApi';
import IngredientForm from './IngredientForm';
import '../../styles/IngredientsTab.css';

export default function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null);

  async function fetchIngredients() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllIngredients();
      setIngredients(data);
    } catch {
      setFetchError('Failed to load ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIngredients();
  }, []);

  function handleCreate() {
    setEditTarget(null);
    setDeleteError(null);
    setModalOpen(true);
  }

  function handleEdit(ingredient: Ingredient) {
    setEditTarget(ingredient);
    setDeleteError(null);
    setModalOpen(true);
  }

  async function handleDelete(ingredient: Ingredient) {
    setDeleteError(null);
    try {
      await deleteIngredient(ingredient.ingredientId);
      setIngredients(prev => prev.filter(i => i.ingredientId !== ingredient.ingredientId));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      if (axiosErr.response?.data?.error) {
        setDeleteError(axiosErr.response.data.error);
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete ingredient. Please try again.');
      }
    }
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleSave() {
    setModalOpen(false);
    setEditTarget(null);
    fetchIngredients();
  }

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Ingredients</h2>
        <button className="btn-create" onClick={handleCreate}>
          + Create Ingredient
        </button>
      </div>

      {deleteError && (
        <div role="alert" className="alert-banner">
          {deleteError}
        </div>
      )}

      {fetchError && (
        <div role="alert" className="alert-banner">
          {fetchError}
        </div>
      )}

      {loading ? (
        <p className="empty-text">Loading ingredients…</p>
      ) : ingredients.length === 0 ? (
        <p className="empty-text">No ingredients found. Create one to get started.</p>
      ) : (
        <table className="data-table" aria-label="Ingredients table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ingredient => (
              <tr key={ingredient.ingredientId}>
                <td>
                  {ingredient.imageUrl ? (
                    <img
                      src={ingredient.imageUrl}
                      alt={ingredient.name}
                      className="ingredient-img"
                    />
                  ) : (
                    <div className="ingredient-img-placeholder" aria-label="No image">
                      No Image
                    </div>
                  )}
                </td>
                <td>{ingredient.name}</td>
                <td>{ingredient.unit}</td>
                <td className="actions-cell">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(ingredient)}
                    aria-label={`Edit ${ingredient.name}`}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(ingredient)}
                    aria-label={`Delete ${ingredient.name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <IngredientForm
          ingredient={editTarget ?? undefined}
          onSave={handleSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
