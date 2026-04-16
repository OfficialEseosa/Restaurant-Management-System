package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.MenuItemIngredientId;

public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, MenuItemIngredientId> {

    boolean existsByIngredientIngredientId(Long ingredientId);

    long countByIngredientIngredientId(Long ingredientId);
}
