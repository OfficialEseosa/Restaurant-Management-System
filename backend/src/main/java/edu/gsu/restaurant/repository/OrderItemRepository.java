package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

}
