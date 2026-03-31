package edu.gsu.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_change_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockChangeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockChangeId;

    @JsonIgnoreProperties({"passwordHash"})
    @ManyToOne
    @JoinColumn(name = "admin_user_id", nullable = false)
    private User adminUser;

    @JsonIgnoreProperties({"inventory"})
    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal changeAmount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime changedAt;
}
