package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.MenuItemIngredientId;

public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, MenuItemIngredientId> {

    @EntityGraph(attributePaths = {"menuItem", "ingredient"})
    @Override
    List<MenuItemIngredient> findAll();

    @Query("SELECT mii FROM MenuItemIngredient mii JOIN FETCH mii.ingredient ing JOIN FETCH ing.inventory WHERE mii.menuItem.menuItemId = :menuItemId")
    List<MenuItemIngredient> findByMenuItemIdWithInventory(@Param("menuItemId") Long menuItemId);

    boolean existsByIngredientIngredientId(Long ingredientId);

    long countByIngredientIngredientId(Long ingredientId);
}
