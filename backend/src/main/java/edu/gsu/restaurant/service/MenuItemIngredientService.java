package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.MenuItemIngredientId;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;
import edu.gsu.restaurant.repository.MenuItemRepository;

@Service
public class MenuItemIngredientService {

    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;

    public MenuItemIngredientService(
            MenuItemIngredientRepository menuItemIngredientRepository,
            MenuItemRepository menuItemRepository,
            IngredientRepository ingredientRepository) {
        this.menuItemIngredientRepository = menuItemIngredientRepository;
        this.menuItemRepository = menuItemRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<MenuItemIngredient> getAllMenuItemIngredients() {
        return menuItemIngredientRepository.findAll();
    }

    public MenuItemIngredient getMenuItemIngredientById(MenuItemIngredientId id) {
        return menuItemIngredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItemIngredient not found"));
    }

    public MenuItemIngredient save(MenuItemIngredient menuItemIngredient) {
        Long menuItemId = menuItemIngredient.getMenuItem().getMenuItemId();
        Long ingredientId = menuItemIngredient.getIngredient().getIngredientId();

        // Populate composite PK if not already set (common when called from REST body)
        if (menuItemIngredient.getId() == null) {
            menuItemIngredient.setId(new MenuItemIngredientId(menuItemId, ingredientId));
        }

        // Replace Jackson-constructed partial objects with JPA proxy references so
        // Hibernate does not treat them as transient and attempt a cascade persist.
        menuItemIngredient.setMenuItem(menuItemRepository.getReferenceById(menuItemId));
        menuItemIngredient.setIngredient(ingredientRepository.getReferenceById(ingredientId));

        return menuItemIngredientRepository.save(menuItemIngredient);
    }

    public void delete(MenuItemIngredientId id) {
        menuItemIngredientRepository.deleteById(id);
    }
}
