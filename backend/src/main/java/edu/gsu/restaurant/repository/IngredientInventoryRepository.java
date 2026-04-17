package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.IngredientInventory;

public interface IngredientInventoryRepository extends JpaRepository<IngredientInventory, Long> {

    @EntityGraph(attributePaths = "ingredient")
    @Override
    List<IngredientInventory> findAll();
}
