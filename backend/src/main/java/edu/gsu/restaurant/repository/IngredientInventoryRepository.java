package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.IngredientInventory;

public interface IngredientInventoryRepository extends JpaRepository<IngredientInventory, Long> {
    
}
