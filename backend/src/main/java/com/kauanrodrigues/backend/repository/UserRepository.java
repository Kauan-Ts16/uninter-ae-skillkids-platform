package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserModel, UUID> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByClassroom_Id(UUID classroomId);

    Optional<UserModel> findByIdAndActive(UUID id, boolean active);

    List<UserModel> findAllByActive(boolean active);

    List<UserModel> findAllByRole_RoleNameAndActiveAndClassroomIsNull(RoleName roleName, boolean active);

    List<UserModel> findAllByClassroom_Id(UUID classroomId);

    Optional<UserModel> findByEmailIgnoreCase(String email);

}
