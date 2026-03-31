package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.StockChangeLog;

public interface StockChangeLogRepository extends JpaRepository<StockChangeLog, Long> {

}
