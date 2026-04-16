package edu.gsu.restaurant.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MenuItemWithAvailabilityDTO {

    private Long menuItemId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
    private boolean available;

    public MenuItemWithAvailabilityDTO() {}

    public MenuItemWithAvailabilityDTO(Long menuItemId, String name, String description,
                                       BigDecimal price, String imageUrl, boolean active,
                                       LocalDateTime createdAt, boolean available) {
        this.menuItemId = menuItemId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.active = active;
        this.createdAt = createdAt;
        this.available = available;
    }

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
