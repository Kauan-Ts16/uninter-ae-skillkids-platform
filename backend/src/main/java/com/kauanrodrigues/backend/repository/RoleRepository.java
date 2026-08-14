package com.kauanrodrigues.backend.repository;

import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.model.RoleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<RoleModel, UUID> {

    Optional<RoleModel> findByRoleName(RoleName roleName);
}
