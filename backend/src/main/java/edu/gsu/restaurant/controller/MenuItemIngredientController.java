package edu.gsu.restaurant.controller;

import java.math.BigDecimal;
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

    @GetMapping("/menu-item/{menuItemId}")
    public List<MenuItemIngredient> getByMenuItemId(@PathVariable Long menuItemId) {
        return menuItemIngredientService.getByMenuItemId(menuItemId);
    }

    @GetMapping("/{menuItemId}/{ingredientId}")
    public MenuItemIngredient getById(@PathVariable Long menuItemId, @PathVariable Long ingredientId) {
        return menuItemIngredientService.getMenuItemIngredientById(new MenuItemIngredientId(menuItemId, ingredientId));
    }

    public record MenuItemRef(Long menuItemId) {}
    public record IngredientRef(Long ingredientId) {}
    public record CreateMenuItemIngredientRequest(MenuItemRef menuItem, IngredientRef ingredient, BigDecimal quantityRequired) {}
    public record UpdateMenuItemIngredientRequest(BigDecimal quantityRequired) {}

    @PostMapping
    public MenuItemIngredient create(@RequestBody CreateMenuItemIngredientRequest request) {
        MenuItemIngredient payload = new MenuItemIngredient();
        payload.setQuantityRequired(request.quantityRequired());
        return menuItemIngredientService.saveForMenuItemAndIngredient(
                request.menuItem() != null ? request.menuItem().menuItemId() : null,
                request.ingredient() != null ? request.ingredient().ingredientId() : null,
                payload);
    }

    @PutMapping("/{menuItemId}/{ingredientId}")
    public MenuItemIngredient update(@PathVariable Long menuItemId, @PathVariable Long ingredientId,
            @RequestBody UpdateMenuItemIngredientRequest request) {
        MenuItemIngredient payload = new MenuItemIngredient();
        payload.setQuantityRequired(request.quantityRequired());
        return menuItemIngredientService.saveForMenuItemAndIngredient(menuItemId, ingredientId, payload);
    }

    @DeleteMapping("/{menuItemId}/{ingredientId}")
    public void delete(@PathVariable Long menuItemId, @PathVariable Long ingredientId) {
        menuItemIngredientService.delete(new MenuItemIngredientId(menuItemId, ingredientId));
    }
}
