package edu.gsu.restaurant.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.gsu.restaurant.entity.StockChangeLog;
import edu.gsu.restaurant.service.StockChangeLogService;

@RestController
@RequestMapping("/api/stock-change-logs")
public class StockChangeLogController {

    private final StockChangeLogService stockChangeLogService;

    public StockChangeLogController(StockChangeLogService stockChangeLogService) {
        this.stockChangeLogService = stockChangeLogService;
    }

    @GetMapping
    public List<StockChangeLog> getAll() {
        return stockChangeLogService.getAllLogs();
    }

    @GetMapping("/{id}")
    public StockChangeLog getById(@PathVariable Long id) {
        return stockChangeLogService.getById(id);
    }

    @PostMapping
    public StockChangeLog create(@RequestBody StockChangeLog log) {
        return stockChangeLogService.save(log);
    }
}
