package edu.gsu.restaurant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.gsu.restaurant.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.menuItem
            ORDER BY o.placedAt DESC, o.orderId DESC
            """)
    List<Order> findAllWithItemsOrderByPlacedAtDesc();

    @EntityGraph(attributePaths = {"user", "orderItems", "orderItems.menuItem"})
    @Override
    Optional<Order> findById(Long orderId);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.menuItem
            WHERE o.status = :status
            ORDER BY o.placedAt DESC, o.orderId DESC
            """)
    List<Order> findByStatusWithItemsOrderByPlacedAtDesc(@Param("status") String status);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.menuItem
            WHERE o.user.userId = :userId
            ORDER BY o.placedAt DESC, o.orderId DESC
            """)
    List<Order> findByUserUserIdWithItems(@Param("userId") Long userId);
}
