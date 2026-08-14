package com.kauanrodrigues.backend.service;

import com.kauanrodrigues.backend.dto.user.UserPasswordPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.UserMapper;
import com.kauanrodrigues.backend.model.RoleModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.RoleRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.validation.user.UserValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    private final RoleRepository roleRepository;

    private final UserValidator validator;


    @Transactional
    public UserResponseDto save(UserPostDto dto) {
        validator.validateForCreate(dto);

        RoleModel role = findRoleByName(dto.role());

        UserModel user = UserMapper.toModel(dto);

        user.setRole(role);

        user = repository.saveAndFlush(user);

        return UserMapper.toResponse(user);
    }

    @Transactional
    public void delete(UUID id) {
        UserModel user = findModelById(id);

        repository.delete(user);
    }

    @Transactional
    public UserResponseDto update(UUID id, UserPatchDto dto) {
        UserModel user = findModelByIdAndActive(id, true);

        validator.validateForUpdate(user, dto);

        UserMapper.updateModel(dto, user);

        repository.flush();

        return UserMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(UUID id, UserPasswordPatchDto dto) {
        UserModel user = findModelByIdAndActive(id, true);

        validator.validatePasswordChange(dto);

        user.setPassword(dto.password());
    }

    @Transactional
    public void deactivate(UUID id) {
        UserModel user = findModelByIdAndActive(id, true);

        user.setActive(false);
    }

    @Transactional
    public void activate(UUID id)    {
        UserModel user = findModelByIdAndActive(id, false);

        user.setActive(true);
    }

    public List<UserResponseDto> findAll() {
        return repository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public List<UserResponseDto> findAllActive() {
        return repository.findAllByActive(true)
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public List<UserResponseDto> findAllInactive() {
        return repository.findAllByActive(false)
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public UserResponseDto findActiveById(UUID id) {
        return UserMapper.toResponse(findModelByIdAndActive(id, true));
    }

    public UserResponseDto findInactiveById(UUID id) {
        return UserMapper.toResponse(findModelByIdAndActive(id, false));
    }

    private RoleModel findRoleByName(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ExceptionGeneric("Role not found!", "No role found with name: " + roleName, HttpStatus.NOT_FOUND));
    }

    private UserModel findModelById(UUID id) {
        return repository.findById(id)
                .orElseThrow(()-> new ExceptionGeneric("User not found!", "No user found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private UserModel findModelByIdAndActive(UUID id, boolean active) {
        return repository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("User not found!", "No " + (active ? "active" : "inactive") + " user found with id: " + id, HttpStatus.NOT_FOUND));
    }

}
