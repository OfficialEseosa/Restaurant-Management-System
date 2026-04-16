import type { Ingredient } from '../../api/adminApi';
import type { IngredientQuantity } from './MenuItemForm';
import '../../styles/IngredientSelector.css';

interface IngredientSelectorProps {
  allIngredients: Ingredient[];
  selected: IngredientQuantity[];
  onChange: (updated: IngredientQuantity[]) => void;
}

const DEFAULT_QUANTITY = 1;

export default function IngredientSelector({
  allIngredients,
  selected,
  onChange,
}: IngredientSelectorProps) {
  const selectedMap = new Map(selected.map((s) => [s.ingredientId, s.quantityRequired]));

  function handleToggle(ingredientId: number) {
    if (selectedMap.has(ingredientId)) {
      onChange(selected.filter((s) => s.ingredientId !== ingredientId));
    } else {
      onChange([...selected, { ingredientId, quantityRequired: DEFAULT_QUANTITY }]);
    }
  }

  function handleQuantityChange(ingredientId: number, value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;
    onChange(
      selected.map((s) =>
        s.ingredientId === ingredientId ? { ...s, quantityRequired: parsed } : s
      )
    );
  }

  return (
    <div className="ingredient-selector">
      <ul>
        {allIngredients.map((ingredient) => {
          const isSelected = selectedMap.has(ingredient.ingredientId);
          const quantity = selectedMap.get(ingredient.ingredientId);

          return (
            <li key={ingredient.ingredientId}>
              <input
                type="checkbox"
                id={`ingredient-${ingredient.ingredientId}`}
                checked={isSelected}
                onChange={() => handleToggle(ingredient.ingredientId)}
                aria-label={`Select ${ingredient.name}`}
              />
              <label htmlFor={`ingredient-${ingredient.ingredientId}`}>
                {ingredient.name} ({ingredient.unit})
              </label>
              {isSelected && (
                <input
                  type="number"
                  min={0.0001}
                  step="any"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(ingredient.ingredientId, e.target.value)}
                  aria-label={`Quantity for ${ingredient.name}`}
                  className="qty-input"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
