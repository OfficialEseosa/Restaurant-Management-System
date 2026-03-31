package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
}
