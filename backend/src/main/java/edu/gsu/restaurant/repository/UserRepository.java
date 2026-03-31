package edu.gsu.restaurant.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.gsu.restaurant.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
