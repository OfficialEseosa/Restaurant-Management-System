package edu.gsu.restaurant.dto;

public class TopItemDto {

    private String name;
    private long totalQuantity;
    private double totalRevenue;

    public TopItemDto(String name, long totalQuantity, double totalRevenue) {
        this.name = name;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }

    public String getName() { return name; }
    public long getTotalQuantity() { return totalQuantity; }
    public double getTotalRevenue() { return totalRevenue; }
}
