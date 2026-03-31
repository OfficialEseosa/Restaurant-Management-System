package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.MenuItemIngredientId;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;

@Service
public class MenuItemIngredientService {

    private final MenuItemIngredientRepository menuItemIngredientRepository;

    public MenuItemIngredientService(MenuItemIngredientRepository menuItemIngredientRepository) {
        this.menuItemIngredientRepository = menuItemIngredientRepository;
    }

    public List<MenuItemIngredient> getAll() {
        return menuItemIngredientRepository.findAll();
    }

    public MenuItemIngredient getById(MenuItemIngredientId id) {
        return menuItemIngredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItemIngredient not found"));
    }

    public MenuItemIngredient save(MenuItemIngredient menuItemIngredient) {
        return menuItemIngredientRepository.save(menuItemIngredient);
    }

    public void delete(MenuItemIngredientId id) {
        menuItemIngredientRepository.deleteById(id);
    }
}
