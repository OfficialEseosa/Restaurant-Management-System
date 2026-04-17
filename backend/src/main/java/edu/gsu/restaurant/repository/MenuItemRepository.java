package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import edu.gsu.restaurant.entity.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("SELECT mi FROM MenuItem mi ORDER BY mi.name ASC")
    List<MenuItem> findAllByOrderByNameAsc();

    @Query("SELECT DISTINCT mi FROM MenuItem mi " +
           "LEFT JOIN FETCH mi.menuItemIngredients mii " +
           "LEFT JOIN FETCH mii.ingredient ing " +
           "LEFT JOIN FETCH ing.inventory " +
           "ORDER BY mi.name ASC")
    List<MenuItem> findAllWithIngredientInventory();
}
