package edu.gsu.restaurant.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.gsu.restaurant.dto.InventoryForecastDto;
import edu.gsu.restaurant.dto.OrderVolumeDataPoint;
import edu.gsu.restaurant.dto.RevenueDataPoint;
import edu.gsu.restaurant.dto.TopItemDto;
import edu.gsu.restaurant.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/revenue")
    public List<RevenueDataPoint> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return analyticsService.getRevenueOverTime(startDate, endDate);
    }

    @GetMapping("/top-items")
    public List<TopItemDto> getTopItems(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return analyticsService.getTopSellingItems(startDate, endDate);
    }

    @GetMapping("/order-volume")
    public List<OrderVolumeDataPoint> getOrderVolume(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return analyticsService.getOrderVolume(startDate, endDate);
    }

    @GetMapping("/inventory-forecast")
    public List<InventoryForecastDto> getInventoryForecast(
            @RequestParam(defaultValue = "30") int lookbackDays) {
        return analyticsService.getInventoryForecast(lookbackDays);
    }
}
