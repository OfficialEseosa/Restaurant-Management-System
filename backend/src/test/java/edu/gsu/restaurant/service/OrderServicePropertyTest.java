package edu.gsu.restaurant.service;

import edu.gsu.restaurant.dto.PlaceOrderRequest;
import edu.gsu.restaurant.entity.MenuItem;
import edu.gsu.restaurant.entity.Order;
import edu.gsu.restaurant.entity.OrderItem;
import edu.gsu.restaurant.entity.User;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.IngredientInventoryRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;
import edu.gsu.restaurant.repository.MenuItemRepository;
import edu.gsu.restaurant.repository.OrderRepository;
import edu.gsu.restaurant.repository.UserRepository;
import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.constraints.Size;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Property-based tests for OrderService.
 */
@ExtendWith(MockitoExtension.class)
class OrderServicePropertyTest {

    /**
     * Property 1: Place order round-trip — price snapshot correctness
     * Validates: Requirements 3.4, 3.5, 6.1
     *
     * For any non-empty list of valid OrderItemRequest entries (1–5 items,
     * quantity 1–10, price 0.01–999.99), placeOrder must persist exactly that
     * many OrderItem rows with unitPriceAtTime equal to the mocked MenuItem.price.
     */
    @Property
    void placeOrder_priceSnapshotCorrectness(
            @ForAll @Size(min = 1, max = 5) List<@IntRange(min = 1, max = 10) Integer> quantities,
            @ForAll @Size(min = 1, max = 5) List<@IntRange(min = 1, max = 99999) Integer> priceCents) {

        // Align both lists to the same size
        int size = Math.min(quantities.size(), priceCents.size());
        if (size == 0) return;

        List<Integer> qs = quantities.subList(0, size);
        List<Integer> ps = priceCents.subList(0, size);

        // Arrange mocks
        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 1L;
        User user = new User();
        user.setUserId(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        // No ingredients to deduct
        when(menuItemIngredientRepo.findByMenuItemIdWithInventory(anyLong())).thenReturn(List.of());

        List<PlaceOrderRequest.OrderItemRequest> itemRequests = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            long menuItemId = (long) (i + 1);
            BigDecimal price = BigDecimal.valueOf(ps.get(i)).movePointLeft(2); // cents → dollars

            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(price);
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);

            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));

            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, qs.get(i)));
        }

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);

        // Capture what gets saved
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        // Act
        Order result = service.placeOrder(request);

        // Assert: exactly size OrderItems persisted
        assertThat(result.getOrderItems()).hasSize(size);

        // Assert: each unitPriceAtTime matches the mocked MenuItem.price
        for (int i = 0; i < size; i++) {
            long menuItemId = (long) (i + 1);
            BigDecimal expectedPrice = BigDecimal.valueOf(ps.get(i)).movePointLeft(2);
            OrderItem oi = result.getOrderItems().get(i);
            assertThat(oi.getUnitPriceAtTime())
                    .as("unitPriceAtTime for item %d", menuItemId)
                    .isEqualByComparingTo(expectedPrice);
        }

        // Assert: orderRepository.save was called exactly once
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    /**
     * Property 8: Place order transaction atomicity
     * Validates: Requirements 5.2
     *
     * For any PlaceOrderRequest where the last menuItemId does not exist
     * (mock returns empty Optional), placeOrder must throw ResourceNotFoundException
     * and orderRepository.save must never be called.
     */
    @Property
    void placeOrder_atomicity_missingMenuItemPreventsAnySave(
            @ForAll @Size(min = 1, max = 4) List<@IntRange(min = 1, max = 10) Integer> quantities) {

        int validCount = quantities.size();

        // Arrange mocks
        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 1L;
        User user = new User();
        user.setUserId(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));

        List<PlaceOrderRequest.OrderItemRequest> itemRequests = new ArrayList<>();

        // Set up valid items (indices 0..validCount-1)
        for (int i = 0; i < validCount; i++) {
            long menuItemId = (long) (i + 1);
            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(BigDecimal.valueOf(9, 0)); // $9.00
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);
            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, quantities.get(i)));
        }

        // The last item (index validCount) does NOT exist
        long missingMenuItemId = (long) (validCount + 1);
        when(menuItemRepo.findById(missingMenuItemId)).thenReturn(Optional.empty());
        itemRequests.add(new PlaceOrderRequest.OrderItemRequest(missingMenuItemId, 1));

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        // Act & Assert: must throw ResourceNotFoundException
        assertThatThrownBy(() -> service.placeOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);

        // Assert: save must never be called
        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Property 8 (variant): Place order transaction atomicity — inactive menu item
     * Validates: Requirements 5.2
     *
     * For any PlaceOrderRequest where the last menuItemId exists but is inactive,
     * placeOrder must throw ResourceNotFoundException and orderRepository.save
     * must never be called.
     */
    @Property
    void placeOrder_atomicity_inactiveMenuItemPreventsAnySave(
            @ForAll @Size(min = 1, max = 4) List<@IntRange(min = 1, max = 10) Integer> quantities) {

        int validCount = quantities.size();

        // Arrange mocks
        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 1L;
        User user = new User();
        user.setUserId(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));

        List<PlaceOrderRequest.OrderItemRequest> itemRequests = new ArrayList<>();

        // Set up valid (active) items (indices 0..validCount-1)
        for (int i = 0; i < validCount; i++) {
            long menuItemId = (long) (i + 1);
            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(BigDecimal.valueOf(9, 0)); // $9.00
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);
            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, quantities.get(i)));
        }

        // The last item exists but is INACTIVE
        long inactiveMenuItemId = (long) (validCount + 1);
        MenuItem inactiveItem = new MenuItem();
        inactiveItem.setMenuItemId(inactiveMenuItemId);
        inactiveItem.setPrice(BigDecimal.valueOf(5, 0));
        inactiveItem.setActive(false); // inactive!
        inactiveItem.setName("Inactive Item");
        when(menuItemRepo.findById(inactiveMenuItemId)).thenReturn(Optional.of(inactiveItem));
        itemRequests.add(new PlaceOrderRequest.OrderItemRequest(inactiveMenuItemId, 1));

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        // Act & Assert: must throw ResourceNotFoundException
        assertThatThrownBy(() -> service.placeOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);

        // Assert: save must never be called
        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Property 2: Order history sorted newest-first
     * Validates: Requirements 7.2
     *
     * For any list of 2–5 orders with distinct placedAt timestamps,
     * getOrdersByUserId must return them sorted by placedAt descending.
     * The repository mock returns a pre-sorted list; the service must
     * return them in the same order.
     */
    @Property
    void getOrdersByUserId_returnsSortedByPlacedAtDesc(
            @ForAll @Size(min = 2, max = 5) List<@IntRange(min = 0, max = 9999) Integer> offsetMinutes) {

        // Arrange mocks
        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 42L;

        // Build orders with distinct timestamps (base + offset minutes)
        LocalDateTime base = LocalDateTime.of(2024, 1, 1, 0, 0);
        List<Order> sortedOrders = new ArrayList<>();
        // Use distinct offsets by sorting descending (simulate what the repo returns)
        List<Integer> distinctOffsets = offsetMinutes.stream()
                .distinct()
                .sorted((a, b) -> b - a) // descending
                .toList();

        if (distinctOffsets.size() < 2) return; // need at least 2 distinct timestamps

        for (int i = 0; i < distinctOffsets.size(); i++) {
            Order order = new Order();
            order.setOrderId((long) (i + 1));
            order.setStatus("PLACED");
            order.setPlacedAt(base.plusMinutes(distinctOffsets.get(i)));
            sortedOrders.add(order);
        }

        when(orderRepo.findByUserUserIdWithItems(userId)).thenReturn(sortedOrders);

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        // Act
        List<Order> result = service.getOrdersByUserId(userId);

        // Assert: result matches the pre-sorted list exactly
        assertThat(result).hasSize(sortedOrders.size());
        for (int i = 0; i < result.size(); i++) {
            assertThat(result.get(i).getPlacedAt())
                    .as("order at index %d", i)
                    .isEqualTo(sortedOrders.get(i).getPlacedAt());
        }

        // Assert: each consecutive pair is in descending order
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getPlacedAt())
                    .as("order[%d].placedAt should be >= order[%d].placedAt", i, i + 1)
                    .isAfterOrEqualTo(result.get(i + 1).getPlacedAt());
        }
    }
}
