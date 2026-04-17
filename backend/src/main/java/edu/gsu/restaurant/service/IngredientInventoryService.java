package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import edu.gsu.restaurant.entity.IngredientInventory;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;
import edu.gsu.restaurant.repository.IngredientRepository;

@Service
public class IngredientInventoryService {

    private final IngredientInventoryRepository ingredientInventoryRepository;
    private final IngredientRepository ingredientRepository;

    public IngredientInventoryService(IngredientInventoryRepository ingredientInventoryRepository,
                                      IngredientRepository ingredientRepository) {
        this.ingredientInventoryRepository = ingredientInventoryRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<IngredientInventory> getAllInventory() {
        return ingredientInventoryRepository.findAll();
    }

    public IngredientInventory getByIngredientId(Long ingredientId) {
        return ingredientInventoryRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for ingredient: " + ingredientId));
    }

    public IngredientInventory save(IngredientInventory inventory) {
        Long ingredientId = inventory.getIngredientId();
        if (ingredientId == null && inventory.getIngredient() != null) {
            ingredientId = inventory.getIngredient().getIngredientId();
        }
        if (ingredientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ingredientId is required");
        }
        if (inventory.getQuantityOnHand() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantityOnHand must be 0 or greater");
        }

        IngredientInventory existing = ingredientInventoryRepository.findById(ingredientId)
                .orElseGet(IngredientInventory::new);
        existing.setIngredientId(ingredientId);
        existing.setIngredient(ingredientRepository.getReferenceById(ingredientId));
        existing.setQuantityOnHand(inventory.getQuantityOnHand());
        return ingredientInventoryRepository.save(existing);
    }

    public void delete(Long ingredientId) {
        ingredientInventoryRepository.deleteById(ingredientId);
    }
}
