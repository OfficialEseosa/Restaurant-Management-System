package edu.gsu.restaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.StockChangeLog;

public interface StockChangeLogRepository extends JpaRepository<StockChangeLog, Long> {

    @EntityGraph(attributePaths = {"adminUser", "ingredient"})
    @Override
    List<StockChangeLog> findAll();
}
