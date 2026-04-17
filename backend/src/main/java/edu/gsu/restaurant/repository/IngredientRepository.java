package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.Ingredient;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    @EntityGraph(attributePaths = "inventory")
    @Override
    List<Ingredient> findAll();
}
