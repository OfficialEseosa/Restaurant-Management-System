package edu.gsu.restaurant.dto;

public class RevenueDataPoint {

    private String date;
    private double revenue;

    public RevenueDataPoint(String date, double revenue) {
        this.date = date;
        this.revenue = revenue;
    }

    public String getDate() { return date; }
    public double getRevenue() { return revenue; }
}
