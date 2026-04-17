package edu.gsu.restaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.gsu.restaurant.dto.MenuItemAvailabilityDto;
import edu.gsu.restaurant.entity.IngredientInventory;
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

    @Transactional(readOnly = true)
    public List<MenuItemAvailabilityDto> getMenuItemsWithAvailability() {
        List<MenuItem> items = menuItemRepository.findAllWithIngredientInventory();
        return items.stream().map(item -> {
            boolean available = item.isActive() && item.getMenuItemIngredients().stream()
                    .allMatch(mii -> {
                        IngredientInventory inv = mii.getIngredient().getInventory();
                        return inv != null && inv.getQuantityOnHand() >= mii.getQuantityRequired().intValue();
                    });
            return new MenuItemAvailabilityDto(item, available);
        }).collect(Collectors.toList());
    }

    public MenuItem save(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public void delete(Long id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + id));
        menuItem.setActive(false);
        menuItemRepository.save(menuItem);
    }
}
