package edu.gsu.restaurant.dto;

public class OrderVolumeDataPoint {

    private String date;
    private long orderCount;

    public OrderVolumeDataPoint(String date, long orderCount) {
        this.date = date;
        this.orderCount = orderCount;
    }

    public String getDate() { return date; }
    public long getOrderCount() { return orderCount; }
}
