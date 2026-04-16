package edu.gsu.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "inventory")
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ingredientId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @Pattern(
        regexp = "^(https?://[^\\s<>\"]+|/[^\\s<>\"]*)?$",
        message = "imageUrl must be a valid http/https URL or a relative path"
    )
    private String imageUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @JsonManagedReference("ingredient-inventory")
    @OneToOne(mappedBy = "ingredient", cascade = CascadeType.ALL, orphanRemoval = true)
    private IngredientInventory inventory;
}
