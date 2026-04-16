package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.gsu.restaurant.dto.MenuItemIngredientRequest;
import edu.gsu.restaurant.entity.MenuItem;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.MenuItemRepository;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
    }

    public MenuItem save(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public void delete(Long id) {
        menuItemRepository.deleteById(id);
    }

    @Transactional
    public void replaceIngredients(Long menuItemId, List<MenuItemIngredientRequest> ingredients) {
        //TODO (John) replace with real delete-then-insert logic using menuItemIngredientRepository
        // placeholder: no-op
    }
}
