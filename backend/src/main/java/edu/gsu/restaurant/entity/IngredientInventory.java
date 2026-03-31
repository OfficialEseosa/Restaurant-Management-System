package edu.gsu.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredient_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "ingredient")
public class IngredientInventory {
    @Id
    private Long ingredientId;

    private int quantityOnHand;

    @UpdateTimestamp
    private LocalDateTime lastUpdatedAt;

    @JsonBackReference("ingredient-inventory")
    @OneToOne
    @MapsId
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;
}
