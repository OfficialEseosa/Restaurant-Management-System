import { useState, useEffect, useRef } from 'react';
import type { MenuCategory, MenuItem, NewMenuItem, MenuItemIngredientPayload } from '../../api/menuApi';
import { createMenuItem, updateMenuItem, assignIngredientToMenuItem } from '../../api/menuApi';
import type { Ingredient } from '../../api/adminApi';
import { getAllIngredients, uploadImage } from '../../api/adminApi';
import api from '../../api/axios';
import IngredientSelector from './IngredientSelector';
import '../../styles/MenuItemForm.css';

export interface IngredientQuantity {
  ingredientId: number;
  quantityRequired: number;
}

export interface MenuItemWithIngredients extends MenuItem {
  menuItemIngredients: Array<{
    ingredient: Ingredient;
    quantityRequired: number;
  }>;
}

const updateMenuItemIngredient = (
  menuItemId: number,
  ingredientId: number,
  payload: { quantityRequired: number }
) => api.put<unknown>(`/api/menu-item-ingredients/${menuItemId}/${ingredientId}`, payload).then((r: { data: unknown }) => r.data);

const deleteMenuItemIngredient = (menuItemId: number, ingredientId: number) =>
  api.delete<unknown>(`/api/menu-item-ingredients/${menuItemId}/${ingredientId}`).then((r: { data: unknown }) => r.data);

interface MenuItemFormProps {
  item?: MenuItemWithIngredients;
  onSave: () => void;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
}

const MENU_CATEGORY_OPTIONS: Array<{ value: MenuCategory; label: string }> = [
  { value: 'BURGERS', label: 'Burgers' },
  { value: 'SANDWICHES', label: 'Sandwiches' },
  { value: 'FRIES', label: 'Fries' },
  { value: 'SIDES', label: 'Sides' },
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'SOUPS', label: 'Soups' },
  { value: 'SWEETS', label: 'Sweets' },
  { value: 'DRINKS', label: 'Drinks' },
];

export async function handleSaveMenuItem(
  formData: NewMenuItem,
  selectedIngredients: IngredientQuantity[],
  existingItem: MenuItemWithIngredients | undefined,
  onSave: () => void
): Promise<void> {
  if (existingItem === undefined) {
    // Create flow
    const menuItem: MenuItem = await createMenuItem(formData); //TODO (John)

    for (const entry of selectedIngredients) {
      const payload: MenuItemIngredientPayload = {
        menuItem: { menuItemId: menuItem.menuItemId },
        ingredient: { ingredientId: entry.ingredientId },
        quantityRequired: entry.quantityRequired,
      };
      await assignIngredientToMenuItem(payload); //TODO (John)
    }
  } else {
    // Update flow
    await updateMenuItem(existingItem.menuItemId, formData); //TODO (John)

    const existingIds = new Set(
      existingItem.menuItemIngredients.map((mii) => mii.ingredient.ingredientId)
    );
    const newIds = new Set(selectedIngredients.map((e) => e.ingredientId));

    const toRemove = [...existingIds].filter((id) => !newIds.has(id));
    const toAdd = [...newIds].filter((id) => !existingIds.has(id));
    const toUpdate = [...existingIds].filter((id) => newIds.has(id));

    for (const ingredientId of toRemove) {
      await deleteMenuItemIngredient(existingItem.menuItemId, ingredientId); //TODO (John)
    }

    for (const entry of selectedIngredients.filter((e) => toAdd.includes(e.ingredientId))) {
      await assignIngredientToMenuItem({ //TODO (John)
        menuItem: { menuItemId: existingItem.menuItemId },
        ingredient: { ingredientId: entry.ingredientId },
        quantityRequired: entry.quantityRequired,
      });
    }

    for (const entry of selectedIngredients.filter((e) => toUpdate.includes(e.ingredientId))) {
      await updateMenuItemIngredient( //TODO (John)
        existingItem.menuItemId,
        entry.ingredientId,
        { quantityRequired: entry.quantityRequired }
      );
    }
  }

  onSave();
}

export default function MenuItemForm({ item, onSave, onClose }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState<MenuCategory>(item?.category ?? 'SIDES');
  const [price, setPrice] = useState(item?.price !== undefined ? String(item.price) : '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '');
  const [active, setActive] = useState(item?.active ?? true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientQuantity[]>(() => {
    if (!item) return [];
    return item.menuItemIngredients.map((mii) => ({
      ingredientId: mii.ingredient.ingredientId,
      quantityRequired: mii.quantityRequired,
    }));
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isEditMode = item !== undefined;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
    } catch {
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    getAllIngredients()
      .then(setAllIngredients)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load ingredients.';
        setApiError(message);
      });
  }, []);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!category) newErrors.category = 'Category is required.';
    const parsedPrice = parseFloat(price);
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Price must be greater than 0.';
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const formData: NewMenuItem = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      imageUrl: imageUrl.trim(),
      active,
    };

    try {
      await handleSaveMenuItem(formData, selectedIngredients, item, onSave);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-item-form-title">
      <div className="modal-box">
        <h2 id="menu-item-form-title">
          {isEditMode ? 'Edit Menu Item' : 'New Menu Item'}
        </h2>

        {apiError && (
          <div role="alert" className="api-error-banner">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-field">
            <label htmlFor="menu-item-name">
              Name <span aria-hidden="true" className="required-star">*</span>
            </label>
            <input
              id="menu-item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'input-error' : ''}
              aria-required="true"
              aria-describedby={errors.name ? 'menu-item-name-error' : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span id="menu-item-name-error" className="field-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Category */}
          <div className="form-field">
            <label htmlFor="menu-item-category">
              Category <span aria-hidden="true" className="required-star">*</span>
            </label>
            <select
              id="menu-item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuCategory)}
              className={errors.category ? 'input-error' : ''}
              aria-required="true"
              aria-describedby={errors.category ? 'menu-item-category-error' : undefined}
              aria-invalid={!!errors.category}
            >
              {MENU_CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span id="menu-item-category-error" className="field-error" role="alert">
                {errors.category}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="form-field">
            <label htmlFor="menu-item-price">
              Price <span aria-hidden="true" className="required-star">*</span>
            </label>
            <input
              id="menu-item-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={errors.price ? 'input-error' : ''}
              aria-required="true"
              aria-describedby={errors.price ? 'menu-item-price-error' : undefined}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <span id="menu-item-price-error" className="field-error" role="alert">
                {errors.price}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-field">
            <label htmlFor="menu-item-description">Description</label>
            <textarea
              id="menu-item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="form-field">
            <label>Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {uploadError && (
              <span className="field-error" role="alert">{uploadError}</span>
            )}
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="image-preview" />
            )}
          </div>

          {/* Active */}
          <div className="form-field-inline">
            <input
              id="menu-item-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              aria-label="Active"
            />
            <label htmlFor="menu-item-active">Active</label>
          </div>

          {/* Ingredient Selector */}
          <div className="form-field-ingredients">
            <span className="field-label">Ingredients</span>
            <IngredientSelector
              allIngredients={allIngredients}
              selected={selectedIngredients}
              onChange={setSelectedIngredients}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
