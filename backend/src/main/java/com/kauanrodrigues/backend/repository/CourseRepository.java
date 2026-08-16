package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.model.CourseModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<CourseModel, UUID> {

    boolean existsByTitleIgnoreCase(String title);

    Optional<CourseModel> findByIdAndActive(UUID id, boolean active);

    List<CourseModel> findAllByActive(boolean active);

}
