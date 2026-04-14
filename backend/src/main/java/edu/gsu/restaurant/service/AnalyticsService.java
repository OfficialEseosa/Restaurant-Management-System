package edu.gsu.restaurant.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.gsu.restaurant.dto.InventoryForecastDto;
import edu.gsu.restaurant.dto.OrderVolumeDataPoint;
import edu.gsu.restaurant.dto.RevenueDataPoint;
import edu.gsu.restaurant.dto.TopItemDto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class AnalyticsService {

    @PersistenceContext
    private EntityManager entityManager;

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<RevenueDataPoint> getRevenueOverTime(LocalDate startDate, LocalDate endDate) {
        String sql =
            "SELECT DATE(o.placed_at) AS day, " +
            "       SUM(oi.quantity * oi.unit_price_at_time) AS revenue " +
            "FROM orders o " +
            "JOIN order_items oi ON o.order_id = oi.order_id " +
            "WHERE o.status = 'PLACED' " +
            "  AND DATE(o.placed_at) BETWEEN :start AND :end " +
            "GROUP BY DATE(o.placed_at) " +
            "ORDER BY day";

        List<Object[]> rows = entityManager.createNativeQuery(sql)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        return rows.stream()
                .map(r -> new RevenueDataPoint(r[0].toString(), ((Number) r[1]).doubleValue()))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<TopItemDto> getTopSellingItems(LocalDate startDate, LocalDate endDate) {
        String sql =
            "SELECT mi.name, " +
            "       SUM(oi.quantity) AS total_qty, " +
            "       SUM(oi.quantity * oi.unit_price_at_time) AS total_revenue " +
            "FROM order_items oi " +
            "JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id " +
            "JOIN orders o ON oi.order_id = o.order_id " +
            "WHERE o.status = 'PLACED' " +
            "  AND DATE(o.placed_at) BETWEEN :start AND :end " +
            "GROUP BY mi.menu_item_id, mi.name " +
            "ORDER BY total_qty DESC";

        List<Object[]> rows = entityManager.createNativeQuery(sql)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        return rows.stream()
                .map(r -> new TopItemDto(
                        (String) r[0],
                        ((Number) r[1]).longValue(),
                        ((Number) r[2]).doubleValue()))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<OrderVolumeDataPoint> getOrderVolume(LocalDate startDate, LocalDate endDate) {
        String sql =
            "SELECT DATE(o.placed_at) AS day, COUNT(o.order_id) AS order_count " +
            "FROM orders o " +
            "WHERE o.status = 'PLACED' " +
            "  AND DATE(o.placed_at) BETWEEN :start AND :end " +
            "GROUP BY DATE(o.placed_at) " +
            "ORDER BY day";

        List<Object[]> rows = entityManager.createNativeQuery(sql)
                .setParameter("start", startDate)
                .setParameter("end", endDate)
                .getResultList();

        return rows.stream()
                .map(r -> new OrderVolumeDataPoint(r[0].toString(), ((Number) r[1]).longValue()))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    @Transactional(readOnly = true)
    public List<InventoryForecastDto> getInventoryForecast(int lookbackDays) {
        String sql =
            "SELECT i.name, i.unit, " +
            "       COALESCE(inv.quantity_on_hand, 0) AS current_stock, " +
            "       COALESCE(SUM(oi.quantity * mii.quantity_required), 0) AS estimated_demand " +
            "FROM ingredients i " +
            "LEFT JOIN ingredient_inventory inv ON inv.ingredient_id = i.ingredient_id " +
            "LEFT JOIN menu_item_ingredients mii ON mii.ingredient_id = i.ingredient_id " +
            "LEFT JOIN order_items oi ON oi.menu_item_id = mii.menu_item_id " +
            "LEFT JOIN orders o ON o.order_id = oi.order_id " +
            "    AND o.status = 'PLACED' " +
            "    AND o.placed_at >= DATE_SUB(NOW(), INTERVAL :days DAY) " +
            "GROUP BY i.ingredient_id, i.name, i.unit, inv.quantity_on_hand " +
            "ORDER BY estimated_demand DESC";

        List<Object[]> rows = entityManager.createNativeQuery(sql)
                .setParameter("days", lookbackDays)
                .getResultList();

        return rows.stream()
                .map(r -> new InventoryForecastDto(
                        (String) r[0],
                        (String) r[1],
                        ((Number) r[2]).doubleValue(),
                        ((Number) r[3]).doubleValue(),
                        1))
                .collect(Collectors.toList());
    }
}
