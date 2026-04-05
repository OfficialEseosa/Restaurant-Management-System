package edu.gsu.restaurant.dto;

import edu.gsu.restaurant.entity.MenuItem;
import java.math.BigDecimal;

public class MenuItemAvailabilityDto {

    private Long menuItemId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private boolean active;
    private boolean available;

    public MenuItemAvailabilityDto(MenuItem item, boolean available) {
        this.menuItemId = item.getMenuItemId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.price = item.getPrice();
        this.imageUrl = item.getImageUrl();
        this.active = item.isActive();
        this.available = available;
    }

    public Long getMenuItemId() { return menuItemId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public boolean isAvailable() { return available; }
}
