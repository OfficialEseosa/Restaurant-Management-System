package edu.gsu.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredient_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ingredientId;

    private int quantityOnHand;

    private LocalDateTime lastUpdatedAt;

    @OneToOne
    @MapsId
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;
}
