package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.gsu.restaurant.entity.Ingredient;
import edu.gsu.restaurant.entity.IngredientInventory;
import edu.gsu.restaurant.exception.ConflictException;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;
import edu.gsu.restaurant.repository.IngredientRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;

@Service
public class IngredientService {
    private final IngredientRepository ingredientRepository;
    private final IngredientInventoryRepository ingredientInventoryRepository;
    private final MenuItemIngredientRepository menuItemIngredientRepository;

    public IngredientService(IngredientRepository ingredientRepository,
                             IngredientInventoryRepository ingredientInventoryRepository,
                             MenuItemIngredientRepository menuItemIngredientRepository) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientInventoryRepository = ingredientInventoryRepository;
        this.menuItemIngredientRepository = menuItemIngredientRepository;
    }

    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    public Ingredient getIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found: " + id));
    }

    @Transactional
    public Ingredient save(Ingredient ingredient) {
        if (ingredient.getIngredientId() != null && ingredientRepository.existsById(ingredient.getIngredientId())) {
            Ingredient existing = ingredientRepository.findById(ingredient.getIngredientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found: " + ingredient.getIngredientId()));
            existing.setName(ingredient.getName());
            existing.setUnit(ingredient.getUnit());
            existing.setImageUrl(ingredient.getImageUrl());
            Ingredient savedExisting = ingredientRepository.save(existing);
            ensureInventoryRow(savedExisting.getIngredientId());
            return savedExisting;
        }

        Ingredient saved = ingredientRepository.save(ingredient);
        ensureInventoryRow(saved.getIngredientId());
        return saved;
    }

    public void delete(Long id) {
        boolean isReferenced = menuItemIngredientRepository.existsByIngredientIngredientId(id);
        if (isReferenced) {
            long count = menuItemIngredientRepository.countByIngredientIngredientId(id);
            throw new ConflictException("Ingredient is referenced by " + count + " menu item(s) and cannot be deleted.");
        }
        ingredientRepository.deleteById(id);
    }

    private void ensureInventoryRow(Long ingredientId) {
        if (ingredientId == null || ingredientInventoryRepository.existsById(ingredientId)) {
            return;
        }

        IngredientInventory inventory = new IngredientInventory();
        // Do NOT set ingredientId — @MapsId derives the PK from the ingredient reference.
        // Setting it explicitly would cause Spring Data to call em.merge() on a new entity,
        // which triggers a Hibernate AssertionFailure during @MapsId resolution.
        inventory.setIngredient(ingredientRepository.getReferenceById(ingredientId));
        inventory.setQuantityOnHand(0);
        ingredientInventoryRepository.save(inventory);
    }
}
