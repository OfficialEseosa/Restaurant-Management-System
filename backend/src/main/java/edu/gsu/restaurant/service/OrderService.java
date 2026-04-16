package edu.gsu.restaurant.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import edu.gsu.restaurant.dto.PlaceOrderRequest;
import edu.gsu.restaurant.entity.IngredientInventory;
import edu.gsu.restaurant.entity.MenuItem;
import edu.gsu.restaurant.entity.MenuItemIngredient;
import edu.gsu.restaurant.entity.Order;
import edu.gsu.restaurant.entity.OrderItem;
import edu.gsu.restaurant.entity.User;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;
import edu.gsu.restaurant.repository.MenuItemRepository;
import edu.gsu.restaurant.repository.OrderRepository;
import edu.gsu.restaurant.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final IngredientInventoryRepository inventoryRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        MenuItemRepository menuItemRepository,
                        MenuItemIngredientRepository menuItemIngredientRepository,
                        IngredientInventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.menuItemIngredientRepository = menuItemIngredientRepository;
        this.inventoryRepository = inventoryRepository;
    }

    private static final List<String> VALID_STATUSES = List.of("PLACED", "READY", "COMPLETE", "CANCELLED");

    public List<Order> getAllOrders(String status) {
        if (status == null || status.isBlank()) {
            return orderRepository.findAll();
        }
        return orderRepository.findByStatus(status.toUpperCase());
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserUserIdWithItems(userId);
    }

    @Transactional
    public Order placeOrder(PlaceOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setPlacedAt(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        for (PlaceOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found: " + itemReq.getMenuItemId()));
            if (!menuItem.isActive()) {
                throw new ResourceNotFoundException("Menu item is not available: " + itemReq.getMenuItemId());
            }

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setMenuItem(menuItem);
            oi.setQuantity(itemReq.getQuantity());
            oi.setUnitPriceAtTime(menuItem.getPrice());
            orderItems.add(oi);
        }

        order.setOrderItems(orderItems);
        Order saved = orderRepository.save(order);

        // Deduct ingredient inventory for every item in the order
        for (OrderItem oi : orderItems) {
            List<MenuItemIngredient> ingredients =
                    menuItemIngredientRepository.findByMenuItemIdWithInventory(oi.getMenuItem().getMenuItemId());
            for (MenuItemIngredient mii : ingredients) {
                IngredientInventory inv = mii.getIngredient().getInventory();
                if (inv != null) {
                    int deduction = mii.getQuantityRequired().multiply(
                            java.math.BigDecimal.valueOf(oi.getQuantity())).intValue();
                    inv.setQuantityOnHand(Math.max(0, inv.getQuantityOnHand() - deduction));
                    inventoryRepository.save(inv);
                }
            }
        }

        return saved;
    }

    public Order updateOrderStatus(Long id, String status) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Must be one of: " + VALID_STATUSES);
        }
        Order order = getOrderById(id);
        order.setStatus(status.toUpperCase());
        return orderRepository.save(order);
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }
}
