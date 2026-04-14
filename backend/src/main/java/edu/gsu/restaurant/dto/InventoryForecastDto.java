package edu.gsu.restaurant.dto;

public class InventoryForecastDto {

    private String ingredientName;
    private String unit;
    private double currentStock;
    private double estimatedDemand;
    private boolean belowThreshold;

    public InventoryForecastDto(String ingredientName, String unit,
                                double currentStock, double estimatedDemand,
                                int thresholdMultiplier) {
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.currentStock = currentStock;
        this.estimatedDemand = estimatedDemand;
        this.belowThreshold = currentStock < estimatedDemand * thresholdMultiplier;
    }

    public String getIngredientName() { return ingredientName; }
    public String getUnit() { return unit; }
    public double getCurrentStock() { return currentStock; }
    public double getEstimatedDemand() { return estimatedDemand; }
    public boolean isBelowThreshold() { return belowThreshold; }
}
