package edu.gsu.restaurant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.gsu.restaurant.entity.StockChangeLog;
import edu.gsu.restaurant.exception.ResourceNotFoundException;
import edu.gsu.restaurant.repository.StockChangeLogRepository;

@Service
public class StockChangeLogService {

    private final StockChangeLogRepository stockChangeLogRepository;

    public StockChangeLogService(StockChangeLogRepository stockChangeLogRepository) {
        this.stockChangeLogRepository = stockChangeLogRepository;
    }

    public List<StockChangeLog> getAllLogs() {
        return stockChangeLogRepository.findAll();
    }

    public StockChangeLog getById(Long id) {
        return stockChangeLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock change log not found: " + id));
    }

    public StockChangeLog save(StockChangeLog log) {
        return stockChangeLogRepository.save(log);
    }

    public void delete(Long id) {
        stockChangeLogRepository.deleteById(id);
    }
}
