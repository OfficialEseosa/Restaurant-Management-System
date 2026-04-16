package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserUserIdOrderByPlacedAtDesc(Long userId);
}
