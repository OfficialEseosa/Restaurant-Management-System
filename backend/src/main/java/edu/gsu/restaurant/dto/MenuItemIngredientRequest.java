package edu.gsu.restaurant.dto;

import java.math.BigDecimal;

public record MenuItemIngredientRequest(Long ingredientId, BigDecimal quantityRequired) {
}
