package edu.gsu.restaurant.dto;

import java.util.List;
import java.time.LocalDateTime;

public class PlaceOrderRequest {

    private Long userId;
    private List<OrderItemRequest> items;
    private LocalDateTime placedAt;

    public PlaceOrderRequest() {}

    public PlaceOrderRequest(Long userId, List<OrderItemRequest> items) {
        this(userId, items, null);
    }

    public PlaceOrderRequest(Long userId, List<OrderItemRequest> items, LocalDateTime placedAt) {
        this.userId = userId;
        this.items = items;
        this.placedAt = placedAt;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }

    public static class OrderItemRequest {
        private Long menuItemId;
        private int quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(Long menuItemId, int quantity) {
            this.menuItemId = menuItemId;
            this.quantity = quantity;
        }

        public Long getMenuItemId() { return menuItemId; }
        public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}
