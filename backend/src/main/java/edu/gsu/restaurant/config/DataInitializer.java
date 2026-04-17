package edu.gsu.restaurant.config;

import edu.gsu.restaurant.entity.User;
import edu.gsu.restaurant.entity.MenuCategory;
import edu.gsu.restaurant.entity.MenuItem;
import edu.gsu.restaurant.repository.MenuItemRepository;
import edu.gsu.restaurant.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public DataInitializer(UserRepository userRepository, MenuItemRepository menuItemRepository) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(new BCryptPasswordEncoder().encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }

        // Backfill legacy rows created before category was introduced.
        List<MenuItem> uncategorized = menuItemRepository.findAll().stream()
                .filter(item -> item.getCategory() == null)
                .toList();
        if (!uncategorized.isEmpty()) {
            uncategorized.forEach(item -> item.setCategory(MenuCategory.SIDES));
            menuItemRepository.saveAll(uncategorized);
        }
    }
}
