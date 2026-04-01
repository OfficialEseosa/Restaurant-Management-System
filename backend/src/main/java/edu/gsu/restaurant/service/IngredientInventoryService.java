package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.gsu.restaurant.entity.IngredientInventory;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;

@Service
public class IngredientInventoryService {

    private final IngredientInventoryRepository ingredientInventoryRepository;

    public IngredientInventoryService(IngredientInventoryRepository ingredientInventoryRepository) {
        this.ingredientInventoryRepository = ingredientInventoryRepository;
    }

    public List<IngredientInventory> getAllInventory() {
        return ingredientInventoryRepository.findAll();
    }

    public IngredientInventory getByIngredientId(Long ingredientId) {
        return ingredientInventoryRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for ingredient: " + ingredientId));
    }

    public IngredientInventory save(IngredientInventory inventory) {
        return ingredientInventoryRepository.save(inventory);
    }

    public void delete(Long ingredientId) {
        ingredientInventoryRepository.deleteById(ingredientId);
    }
}
