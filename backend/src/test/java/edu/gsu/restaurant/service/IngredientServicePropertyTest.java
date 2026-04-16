package edu.gsu.restaurant.service;

import edu.gsu.restaurant.entity.Ingredient;
import edu.gsu.restaurant.exception.ConflictException;
import edu.gsu.restaurant.repository.IngredientRepository;
import edu.gsu.restaurant.repository.MenuItemIngredientRepository;
import net.jqwik.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.Mockito.*;

/**
 * Property-based tests for IngredientService.
 *
 * Property 3: Ingredient deletion guard
 * Validates: Requirements 1.5
 *
 * For any ingredient that is referenced by at least one MenuItemIngredient,
 * attempting to delete that ingredient should throw a ConflictException
 * (which maps to 409 Conflict), and the ingredient should still exist
 * (i.e., deleteById is never called).
 */
@ExtendWith(MockitoExtension.class)
class IngredientServicePropertyTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private MenuItemIngredientRepository menuItemIngredientRepository;

    /**
     * Property 3: Ingredient deletion guard
     * Validates: Requirements 1.5
     *
     * For any ingredient ID, when the ingredient is referenced by at least one
     * MenuItemIngredient, delete() must throw ConflictException and must NOT
     * call ingredientRepository.deleteById().
     */
    @Property
    void ingredientDeletionGuard_throwsConflictWhenReferenced(@ForAll long ingredientId) {
        // Arrange: ingredient exists and is referenced
        IngredientRepository localIngredientRepo = mock(IngredientRepository.class);
        MenuItemIngredientRepository localMenuItemIngredientRepo = mock(MenuItemIngredientRepository.class);

        when(localMenuItemIngredientRepo.existsByIngredientIngredientId(ingredientId)).thenReturn(true);

        IngredientService service = new IngredientService(localIngredientRepo, localMenuItemIngredientRepo);

        // Act & Assert: ConflictException must be thrown
        assertThatThrownBy(() -> service.delete(ingredientId))
                .isInstanceOf(ConflictException.class);

        // The ingredient must NOT be deleted
        verify(localIngredientRepo, never()).deleteById(ingredientId);
    }

    /**
     * Complementary property: when an ingredient is NOT referenced,
     * delete() must NOT throw and must call deleteById().
     */
    @Property
    void ingredientDeletionGuard_succeedsWhenNotReferenced(@ForAll long ingredientId) {
        // Arrange: ingredient is not referenced
        IngredientRepository localIngredientRepo = mock(IngredientRepository.class);
        MenuItemIngredientRepository localMenuItemIngredientRepo = mock(MenuItemIngredientRepository.class);

        when(localMenuItemIngredientRepo.existsByIngredientIngredientId(ingredientId)).thenReturn(false);

        IngredientService service = new IngredientService(localIngredientRepo, localMenuItemIngredientRepo);

        // Act & Assert: no exception thrown
        assertThatNoException().isThrownBy(() -> service.delete(ingredientId));

        // deleteById must have been called
        verify(localIngredientRepo).deleteById(ingredientId);
    }
}
