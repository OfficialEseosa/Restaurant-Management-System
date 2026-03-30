package edu.gsu.restaurant.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MenuItemIngredientId implements Serializable {
    private Long menuItemId;
    private Long ingredientId;
}
