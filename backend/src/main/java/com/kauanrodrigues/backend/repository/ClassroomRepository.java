package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.model.ClassroomModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassroomRepository extends JpaRepository<ClassroomModel, UUID> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByTeacher_Id(UUID teacherId);

    boolean existsByJoinCode(String joinCode);

    Optional<ClassroomModel> findByIdAndActive(UUID id, boolean active);

    List<ClassroomModel> findAllByActive(boolean active);

    List<ClassroomModel> findAllByTeacher_IdAndActive(UUID teacherId, boolean active);

    Optional<ClassroomModel> findByIdAndTeacher_IdAndActive(UUID id, UUID teacherId, boolean active);

    Optional<ClassroomModel> findByJoinCodeIgnoreCaseAndActive(String joinCode, boolean active);

}
