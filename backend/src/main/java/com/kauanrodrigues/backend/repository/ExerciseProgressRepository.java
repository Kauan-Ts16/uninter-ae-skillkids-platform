package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.model.ExerciseProgressModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseProgressRepository extends JpaRepository<ExerciseProgressModel, UUID> {

    Optional<ExerciseProgressModel> findByStudentIdAndExerciseId(UUID studentId, UUID exerciseId);

    List<ExerciseProgressModel> findAllByStudentId(UUID studentId);

    boolean existsByStudentId(UUID studentId);

    boolean existsByExerciseId(UUID exerciseId);

}
