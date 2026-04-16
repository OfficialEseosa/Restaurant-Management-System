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
     * For any non-empty list of valid OrderItemRequest entries, placeOrder must
     * persist exactly that many OrderItem rows with unitPriceAtTime equal to the
     * mocked MenuItem.price.
     */
    @Property
    void placeOrder_priceSnapshotCorrectness(
            @ForAll @Size(min = 1, max = 5) List<@IntRange(min = 1, max = 10) Integer> quantities,
            @ForAll @Size(min = 1, max = 5) List<@IntRange(min = 1, max = 99999) Integer> priceCents) {

        int size = Math.min(quantities.size(), priceCents.size());
        if (size == 0) return;

        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 1L;
        User user = new User();
        user.setUserId(userId);
        when(userRepo.findById(userId)).thenReturn(Optional.of(user));
        when(menuItemIngredientRepo.findByMenuItemIdWithInventory(anyLong())).thenReturn(List.of());

        List<PlaceOrderRequest.OrderItemRequest> itemRequests = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            long menuItemId = (long) (i + 1);
            BigDecimal price = BigDecimal.valueOf(priceCents.get(i)).movePointLeft(2);

            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(price);
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);

            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, quantities.get(i)));
        }

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);
        when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);
        Order result = service.placeOrder(request);

        assertThat(result.getOrderItems()).hasSize(size);

        for (int i = 0; i < size; i++) {
            BigDecimal expectedPrice = BigDecimal.valueOf(priceCents.get(i)).movePointLeft(2);
            OrderItem oi = result.getOrderItems().get(i);
            assertThat(oi.getUnitPriceAtTime())
                    .as("unitPriceAtTime for item %d", i + 1)
                    .isEqualByComparingTo(expectedPrice);
        }

        verify(orderRepo, times(1)).save(any(Order.class));
    }

    /**
     * Property 8: Place order atomicity — missing menu item prevents any save.
     * Validates: Requirements 5.2
     */
    @Property
    void placeOrder_atomicity_missingMenuItemPreventsAnySave(
            @ForAll @Size(min = 1, max = 4) List<@IntRange(min = 1, max = 10) Integer> quantities) {

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
        for (int i = 0; i < quantities.size(); i++) {
            long menuItemId = (long) (i + 1);
            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(BigDecimal.valueOf(9));
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);
            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, quantities.get(i)));
        }

        long missingId = (long) (quantities.size() + 1);
        when(menuItemRepo.findById(missingId)).thenReturn(Optional.empty());
        itemRequests.add(new PlaceOrderRequest.OrderItemRequest(missingId, 1));

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);
        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        assertThatThrownBy(() -> service.placeOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Property 8 (variant): inactive menu item prevents any save.
     * Validates: Requirements 5.2
     */
    @Property
    void placeOrder_atomicity_inactiveMenuItemPreventsAnySave(
            @ForAll @Size(min = 1, max = 4) List<@IntRange(min = 1, max = 10) Integer> quantities) {

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
        for (int i = 0; i < quantities.size(); i++) {
            long menuItemId = (long) (i + 1);
            MenuItem menuItem = new MenuItem();
            menuItem.setMenuItemId(menuItemId);
            menuItem.setPrice(BigDecimal.valueOf(9));
            menuItem.setActive(true);
            menuItem.setName("Item " + menuItemId);
            when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
            itemRequests.add(new PlaceOrderRequest.OrderItemRequest(menuItemId, quantities.get(i)));
        }

        long inactiveId = (long) (quantities.size() + 1);
        MenuItem inactiveItem = new MenuItem();
        inactiveItem.setMenuItemId(inactiveId);
        inactiveItem.setPrice(BigDecimal.valueOf(5));
        inactiveItem.setActive(false);
        inactiveItem.setName("Inactive Item");
        when(menuItemRepo.findById(inactiveId)).thenReturn(Optional.of(inactiveItem));
        itemRequests.add(new PlaceOrderRequest.OrderItemRequest(inactiveId, 1));

        PlaceOrderRequest request = new PlaceOrderRequest(userId, itemRequests);
        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);

        assertThatThrownBy(() -> service.placeOrder(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Property 2: Order history sorted newest-first.
     * Validates: Requirements 7.2
     */
    @Property
    void getOrdersByUserId_returnsSortedByPlacedAtDesc(
            @ForAll @Size(min = 2, max = 5) List<@IntRange(min = 0, max = 9999) Integer> offsetMinutes) {

        UserRepository userRepo = mock(UserRepository.class);
        MenuItemRepository menuItemRepo = mock(MenuItemRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);
        MenuItemIngredientRepository menuItemIngredientRepo = mock(MenuItemIngredientRepository.class);
        IngredientInventoryRepository inventoryRepo = mock(IngredientInventoryRepository.class);

        Long userId = 42L;
        LocalDateTime base = LocalDateTime.of(2024, 1, 1, 0, 0);

        List<Integer> distinctOffsets = offsetMinutes.stream()
                .distinct()
                .sorted((a, b) -> b - a)
                .toList();

        if (distinctOffsets.size() < 2) return;

        List<Order> sortedOrders = new ArrayList<>();
        for (int i = 0; i < distinctOffsets.size(); i++) {
            Order order = new Order();
            order.setOrderId((long) (i + 1));
            order.setStatus("PLACED");
            order.setPlacedAt(base.plusMinutes(distinctOffsets.get(i)));
            sortedOrders.add(order);
        }

        when(orderRepo.findByUserUserIdWithItems(userId)).thenReturn(sortedOrders);

        OrderService service = new OrderService(orderRepo, userRepo, menuItemRepo, menuItemIngredientRepo, inventoryRepo);
        List<Order> result = service.getOrdersByUserId(userId);

        assertThat(result).hasSize(sortedOrders.size());
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getPlacedAt())
                    .as("order[%d] should be >= order[%d]", i, i + 1)
                    .isAfterOrEqualTo(result.get(i + 1).getPlacedAt());
        }
    }
}
