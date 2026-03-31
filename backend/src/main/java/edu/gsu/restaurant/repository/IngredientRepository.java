package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.Ingredient;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    
}
