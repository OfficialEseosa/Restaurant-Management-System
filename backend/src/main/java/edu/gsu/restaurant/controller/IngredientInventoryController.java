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

import edu.gsu.restaurant.entity.IngredientInventory;
import edu.gsu.restaurant.service.IngredientInventoryService;

@RestController
@RequestMapping("/api/inventory")
public class IngredientInventoryController {

    private final IngredientInventoryService ingredientInventoryService;

    public IngredientInventoryController(IngredientInventoryService ingredientInventoryService) {
        this.ingredientInventoryService = ingredientInventoryService;
    }

    @GetMapping
    public List<IngredientInventory> getAll() {
        return ingredientInventoryService.getAllInventory();
    }

    @GetMapping("/{ingredientId}")
    public IngredientInventory getById(@PathVariable Long ingredientId) {
        return ingredientInventoryService.getByIngredientId(ingredientId);
    }

    @PostMapping
    public IngredientInventory create(@RequestBody IngredientInventory inventory) {
        return ingredientInventoryService.save(inventory);
    }

    @PutMapping("/{ingredientId}")
    public IngredientInventory update(@PathVariable Long ingredientId, @RequestBody IngredientInventory inventory) {
        inventory.setIngredientId(ingredientId);
        return ingredientInventoryService.save(inventory);
    }

    @DeleteMapping("/{ingredientId}")
    public void delete(@PathVariable Long ingredientId) {
        ingredientInventoryService.delete(ingredientId);
    }
}
