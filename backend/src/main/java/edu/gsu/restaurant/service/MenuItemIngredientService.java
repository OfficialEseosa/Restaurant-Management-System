package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public List<MenuItemIngredient> getByMenuItemId(Long menuItemId) {
        return menuItemIngredientRepository.findByMenuItemIdWithInventory(menuItemId);
    }

    public MenuItemIngredient getMenuItemIngredientById(MenuItemIngredientId id) {
        return menuItemIngredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItemIngredient not found"));
    }

    public MenuItemIngredient save(MenuItemIngredient menuItemIngredient) {
        Long menuItemId = menuItemIngredient.getMenuItem() != null ? menuItemIngredient.getMenuItem().getMenuItemId() : null;
        Long ingredientId = menuItemIngredient.getIngredient() != null ? menuItemIngredient.getIngredient().getIngredientId() : null;
        if (menuItemId == null || ingredientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "menuItem.menuItemId and ingredient.ingredientId are required");
        }
        return saveForMenuItemAndIngredient(menuItemId, ingredientId, menuItemIngredient);
    }

    public MenuItemIngredient saveForMenuItemAndIngredient(Long menuItemId, Long ingredientId, MenuItemIngredient payload) {
        if (payload == null || payload.getQuantityRequired() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantityRequired is required");
        }

        MenuItemIngredientId id = new MenuItemIngredientId(menuItemId, ingredientId);
        MenuItemIngredient menuItemIngredient = menuItemIngredientRepository.findById(id)
                .orElseGet(MenuItemIngredient::new);

        menuItemIngredient.setId(id);

        // Replace Jackson-constructed partial objects with JPA proxy references so
        // Hibernate does not treat them as transient and attempt a cascade persist.
        menuItemIngredient.setMenuItem(menuItemRepository.getReferenceById(menuItemId));
        menuItemIngredient.setIngredient(ingredientRepository.getReferenceById(ingredientId));
        menuItemIngredient.setQuantityRequired(payload.getQuantityRequired());

        return menuItemIngredientRepository.save(menuItemIngredient);
    }

    public void delete(MenuItemIngredientId id) {
        menuItemIngredientRepository.deleteById(id);
    }
}
