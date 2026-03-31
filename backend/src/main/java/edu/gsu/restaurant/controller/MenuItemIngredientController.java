package edu.gsu.restaurant.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.MenuItemIngredientId;
import edu.gsu.restaurant.service.MenuItemIngredientService;

@RestController
@RequestMapping("/api/menu-item-ingredients")
public class MenuItemIngredientController {

    private final MenuItemIngredientService menuItemIngredientService;

    public MenuItemIngredientController(MenuItemIngredientService menuItemIngredientService) {
        this.menuItemIngredientService = menuItemIngredientService;
    }

    @GetMapping
    public List<MenuItemIngredient> getAll() {
        return menuItemIngredientService.getAllMenuItemIngredients();
    }

    @GetMapping("/{menuItemId}/{ingredientId}")
    public MenuItemIngredient getById(@PathVariable Long menuItemId, @PathVariable Long ingredientId) {
        return menuItemIngredientService.getMenuItemIngredientById(new MenuItemIngredientId(menuItemId, ingredientId));
    }

    @PostMapping
    public MenuItemIngredient create(@RequestBody MenuItemIngredient menuItemIngredient) {
        return menuItemIngredientService.save(menuItemIngredient);
    }

    @PutMapping("/{menuItemId}/{ingredientId}")
    public MenuItemIngredient update(@PathVariable Long menuItemId, @PathVariable Long ingredientId,
            @RequestBody MenuItemIngredient menuItemIngredient) {
        menuItemIngredient.setId(new MenuItemIngredientId(menuItemId, ingredientId));
        return menuItemIngredientService.save(menuItemIngredient);
    }

    @DeleteMapping("/{menuItemId}/{ingredientId}")
    public void delete(@PathVariable Long menuItemId, @PathVariable Long ingredientId) {
        menuItemIngredientService.delete(new MenuItemIngredientId(menuItemId, ingredientId));
    }
}
