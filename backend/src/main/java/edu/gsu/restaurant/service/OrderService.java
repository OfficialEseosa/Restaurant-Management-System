package edu.gsu.restaurant.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.gsu.restaurant.dto.PlaceOrderRequest;
import edu.gsu.restaurant.entity.MenuItem;
import edu.gsu.restaurant.entity.Order;
import edu.gsu.restaurant.entity.OrderItem;
import edu.gsu.restaurant.entity.User;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.MenuItemRepository;
import edu.gsu.restaurant.repository.OrderRepository;
import edu.gsu.restaurant.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }

    @Transactional
    public Order placeOrder(PlaceOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PLACED");
        order.setPlacedAt(LocalDateTime.now());
        order.setOrderItems(new ArrayList<>());

        for (PlaceOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Menu item not found or inactive: " + itemReq.getMenuItemId()));

            if (!menuItem.isActive()) {
                throw new ResourceNotFoundException(
                        "Menu item not found or inactive: " + itemReq.getMenuItemId());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPriceAtTime(menuItem.getPrice());

            order.getOrderItems().add(orderItem);
        }

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserUserIdOrderByPlacedAtDesc(userId);
    }
}
