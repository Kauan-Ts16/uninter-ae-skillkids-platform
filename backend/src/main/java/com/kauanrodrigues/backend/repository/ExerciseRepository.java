package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.model.ExerciseModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<ExerciseModel, UUID> {

    Optional<ExerciseModel> findByIdAndActive(UUID id, boolean active);

    List<ExerciseModel> findAllByActive(boolean active);

    List<ExerciseModel> findAllByCourseIdOrderBySequenceAsc(UUID courseId);

    Optional<ExerciseModel> findTopByCourseIdOrderBySequenceDesc(UUID courseId);

    List<ExerciseModel> findAllByCourseIdAndActiveOrderBySequenceAsc(UUID courseId, boolean active);

    boolean existsByCourseId(UUID courseId);
}
