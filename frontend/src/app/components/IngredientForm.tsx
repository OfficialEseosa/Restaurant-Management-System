import { useState, useRef } from 'react';
import type { Ingredient, NewIngredient } from '../../api/adminApi';
import { createIngredient, updateIngredient, uploadImage } from '../../api/adminApi';
import '../../styles/IngredientForm.css';

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSave: () => void;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  unit?: string;
}

export default function IngredientForm({ ingredient, onSave, onClose }: IngredientFormProps) {
  const [name, setName] = useState(ingredient?.name ?? '');
  const [unit, setUnit] = useState(ingredient?.unit ?? '');
  const [imageUrl, setImageUrl] = useState(ingredient?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isEditMode = ingredient !== undefined;

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

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!unit.trim()) newErrors.unit = 'Unit is required.';
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

    const payload: NewIngredient = {
      name: name.trim(),
      unit: unit.trim(),
      imageUrl: imageUrl.trim(),
    };

    try {
      if (isEditMode) {
        await updateIngredient(ingredient.ingredientId, payload);
      } else {
        await createIngredient(payload);
      }
      onSave();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ingredient-form-title">
      <div className="modal-box">
        <h2 id="ingredient-form-title">
          {isEditMode ? 'Edit Ingredient' : 'New Ingredient'}
        </h2>

        {apiError && (
          <div role="alert" className="api-error-banner">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-field">
            <label htmlFor="ingredient-name">
              Name <span aria-hidden="true" className="required-star">*</span>
            </label>
            <input
              id="ingredient-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'input-error' : ''}
              aria-required="true"
              aria-describedby={errors.name ? 'ingredient-name-error' : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span id="ingredient-name-error" className="field-error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Unit */}
          <div className="form-field">
            <label htmlFor="ingredient-unit">
              Unit <span aria-hidden="true" className="required-star">*</span>
            </label>
            <input
              id="ingredient-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. grams, ml, pieces"
              className={errors.unit ? 'input-error' : ''}
              aria-required="true"
              aria-describedby={errors.unit ? 'ingredient-unit-error' : undefined}
              aria-invalid={!!errors.unit}
            />
            {errors.unit && (
              <span id="ingredient-unit-error" className="field-error" role="alert">
                {errors.unit}
              </span>
            )}
          </div>

          {/* Image Upload (optional) */}
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
