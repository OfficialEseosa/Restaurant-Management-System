package edu.gsu.restaurant.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import edu.gsu.restaurant.entity.StockChangeLog;
import edu.gsu.restaurant.entity.User;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;
import edu.gsu.restaurant.repository.MenuItemRepository;
import edu.gsu.restaurant.repository.OrderRepository;
import edu.gsu.restaurant.repository.StockChangeLogRepository;
import edu.gsu.restaurant.repository.UserRepository;

@Service
public class OrderService {

    private static final String STATUS_PLACED = "PLACED";
    private static final String STATUS_READY = "READY";
    private static final String STATUS_COMPLETE = "COMPLETE";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final int MIN_GRACE_SECONDS = 5;
    private static final int MAX_GRACE_SECONDS = 10;
    private static final List<String> VALID_STATUSES =
            List.of(STATUS_PLACED, STATUS_READY, STATUS_COMPLETE, STATUS_CANCELLED);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final IngredientInventoryRepository inventoryRepository;
    private final StockChangeLogRepository stockChangeLogRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        MenuItemRepository menuItemRepository,
                        MenuItemIngredientRepository menuItemIngredientRepository,
                        IngredientInventoryRepository inventoryRepository,
                        StockChangeLogRepository stockChangeLogRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.menuItemIngredientRepository = menuItemIngredientRepository;
        this.inventoryRepository = inventoryRepository;
        this.stockChangeLogRepository = stockChangeLogRepository;
    }

    @Transactional
    public List<Order> getAllOrders(String status) {
        String normalizedStatus = null;
        if (status != null && !status.isBlank()) {
            normalizedStatus = status.toUpperCase();
            if (!VALID_STATUSES.contains(normalizedStatus)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid status. Must be one of: " + VALID_STATUSES);
            }
        }

        List<Order> orders = normalizedStatus == null
                ? orderRepository.findAllWithItemsOrderByPlacedAtDesc()
                : orderRepository.findByStatusWithItemsOrderByPlacedAtDesc(normalizedStatus);

        applyLifecycleTransitions(orders);

        if (normalizedStatus == null) {
            return orders;
        }
        final String filter = normalizedStatus;
        return orders.stream().filter(order -> filter.equals(order.getStatus())).toList();
    }

    @Transactional
    public Order getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (applyLifecycleTransition(order, LocalDateTime.now())) {
            return orderRepository.save(order);
        }
        return order;
    }

    @Transactional
    public List<Order> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserUserIdWithItems(userId);
        applyLifecycleTransitions(orders);
        return orders;
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
        order.setStatus(STATUS_PLACED);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime requestedPlacedAt = request.getPlacedAt();
        LocalDateTime placedAt = requestedPlacedAt != null ? requestedPlacedAt : now;
        if (placedAt.isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "placedAt cannot be in the future");
        }
        order.setPlacedAt(placedAt);

        List<OrderItem> orderItems = new ArrayList<>();
        Map<Long, Integer> requiredByIngredientId = new HashMap<>();
        Map<Long, IngredientInventory> inventoryByIngredientId = new HashMap<>();

        for (PlaceOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order item quantity must be greater than 0");
            }

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

            List<MenuItemIngredient> ingredients =
                    menuItemIngredientRepository.findByMenuItemIdWithInventory(menuItem.getMenuItemId());
            if (ingredients.isEmpty()
                    && (menuItem.getCategory() == null || !"DRINKS".equals(menuItem.getCategory().name()))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Menu item recipe is not configured: " + menuItem.getName());
            }

            for (MenuItemIngredient mii : ingredients) {
                IngredientInventory inv = mii.getIngredient().getInventory();
                if (inv == null) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Missing inventory for ingredient: " + mii.getIngredient().getName());
                }
                int required = mii.getQuantityRequired()
                        .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                        .intValue();
                if (required > 0) {
                    requiredByIngredientId.merge(inv.getIngredientId(), required, Integer::sum);
                    inventoryByIngredientId.putIfAbsent(inv.getIngredientId(), inv);
                }
            }
        }

        for (Map.Entry<Long, Integer> req : requiredByIngredientId.entrySet()) {
            IngredientInventory inv = inventoryByIngredientId.get(req.getKey());
            if (inv == null || inv.getQuantityOnHand() < req.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient inventory for one or more ingredients");
            }
        }

        order.setOrderItems(orderItems);
        Order saved = orderRepository.save(order);

        List<StockChangeLog> logEntries = new ArrayList<>();
        for (Map.Entry<Long, Integer> req : requiredByIngredientId.entrySet()) {
            IngredientInventory inv = inventoryByIngredientId.get(req.getKey());
            inv.setQuantityOnHand(inv.getQuantityOnHand() - req.getValue());
            inventoryRepository.save(inv);
            logEntries.add(StockChangeLog.builder()
                    .adminUser(user)
                    .ingredient(inv.getIngredient())
                    .changeAmount(BigDecimal.valueOf(-req.getValue()))
                    .build());
        }
        stockChangeLogRepository.saveAll(logEntries);

        return saved;
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long actingUserId) {
        if (actingUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required to cancel an order");
        }

        User actingUser = userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + actingUserId));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (actingUser.getRole() != User.Role.ADMIN
                && !order.getUser().getUserId().equals(actingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only cancel your own orders");
        }

        LocalDateTime now = LocalDateTime.now();
        if (applyLifecycleTransition(order, now)) {
            orderRepository.save(order);
        }

        if (!STATUS_PLACED.equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Order can no longer be cancelled");
        }

        LocalDateTime autoCompleteAt = getAutoCompleteAt(order);
        if (!now.isBefore(autoCompleteAt)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cancellation window has closed");
        }

        restoreInventory(order);
        order.setStatus(STATUS_CANCELLED);
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, String status) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED,
                "Order status is process-driven. Use POST /api/orders/{id}/cancel during the grace window.");
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    private int getCancellationWindowSeconds(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return MIN_GRACE_SECONDS;
        }

        int totalQuantity = order.getOrderItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        int computed = MIN_GRACE_SECONDS + Math.max(totalQuantity - 1, 0);
        return Math.min(MAX_GRACE_SECONDS, computed);
    }

    private LocalDateTime getAutoCompleteAt(Order order) {
        if (order.getPlacedAt() == null) {
            return LocalDateTime.MIN;
        }
        return order.getPlacedAt().plusSeconds(getCancellationWindowSeconds(order));
    }

    private boolean applyLifecycleTransition(Order order, LocalDateTime now) {
        if (STATUS_READY.equals(order.getStatus())) {
            order.setStatus(STATUS_COMPLETE);
            return true;
        }

        if (!STATUS_PLACED.equals(order.getStatus()) || order.getPlacedAt() == null) {
            return false;
        }

        if (!now.isBefore(getAutoCompleteAt(order))) {
            order.setStatus(STATUS_COMPLETE);
            return true;
        }

        return false;
    }

    private void applyLifecycleTransitions(List<Order> orders) {
        LocalDateTime now = LocalDateTime.now();
        List<Order> changed = new ArrayList<>();

        for (Order order : orders) {
            if (applyLifecycleTransition(order, now)) {
                changed.add(order);
            }
        }

        if (!changed.isEmpty()) {
            orderRepository.saveAll(changed);
        }
    }

    private void restoreInventory(Order order) {
        Map<Long, List<MenuItemIngredient>> ingredientsByMenuItemId = new HashMap<>();

        for (OrderItem orderItem : order.getOrderItems()) {
            Long menuItemId = orderItem.getMenuItem().getMenuItemId();
            List<MenuItemIngredient> ingredients = ingredientsByMenuItemId.computeIfAbsent(
                    menuItemId,
                    menuItemIngredientRepository::findByMenuItemIdWithInventory
            );

            for (MenuItemIngredient ingredientLink : ingredients) {
                IngredientInventory inventory = ingredientLink.getIngredient().getInventory();
                if (inventory == null) {
                    continue;
                }

                int quantityToRestore = ingredientLink.getQuantityRequired()
                        .multiply(BigDecimal.valueOf(orderItem.getQuantity()))
                        .intValue();
                if (quantityToRestore <= 0) {
                    continue;
                }

                inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantityToRestore);
                inventoryRepository.save(inventory);
            }
        }
    }
}
