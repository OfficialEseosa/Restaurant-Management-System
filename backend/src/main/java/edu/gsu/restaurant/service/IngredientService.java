package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.gsu.restaurant.entity.Ingredient;
import edu.gsu.restaurant.exception.ConflictException;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;

@Service
public class IngredientService {
    private final IngredientRepository ingredientRepository;
    private final MenuItemIngredientRepository menuItemIngredientRepository;

    public IngredientService(IngredientRepository ingredientRepository,
                             MenuItemIngredientRepository menuItemIngredientRepository) {
        this.ingredientRepository = ingredientRepository;
        this.menuItemIngredientRepository = menuItemIngredientRepository;
    }

    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    public Ingredient getIngredientById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found: " + id));
    }

    public Ingredient save(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    public void delete(Long id) {
        boolean isReferenced = menuItemIngredientRepository.existsByIngredientIngredientId(id);
        if (isReferenced) {
            long count = menuItemIngredientRepository.countByIngredientIngredientId(id);
            throw new ConflictException("Ingredient is referenced by " + count + " menu item(s) and cannot be deleted.");
        }
        ingredientRepository.deleteById(id);
    }
}
