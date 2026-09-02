package com.kauanrodrigues.backend.service.user;

import com.kauanrodrigues.backend.dto.user.*;
import com.kauanrodrigues.backend.enums.RoleName;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.UserMapper;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.RoleModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.repository.RoleRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.validation.user.UserValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    private final RoleRepository roleRepository;

    private final ClassroomRepository classroomRepository;

    private final UserValidator validator;

    private final PasswordEncoder passwordEncoder;


    @Transactional
    public UserResponseDto save(UserPostDto dto) {
        validator.validateForCreate(dto);

        RoleModel role = findRoleByName(dto.role());

        validator.validateClassroom(role.getRoleName(), dto.classroomId());

        ClassroomModel classroom = null;

        if (dto.classroomId() != null) {
            classroom = findClassroomByIdAndActive(dto.classroomId(), true);
        }

        UserModel user = UserMapper.toModel(dto, classroom);

        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(role);

        user = repository.saveAndFlush(user);

        return UserMapper.toResponse(user);
    }

    @Transactional
    public void delete(UUID id) {
        UserModel user = findModelById(id);

        validator.validateForDelete(user);

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

        user.setPassword(passwordEncoder.encode(dto.password()));
    }

    @Transactional
    public UserResponseDto updateClassroom(UUID id, UserClassroomPatchDto dto) {
        UserModel student = findModelByIdAndActive(id, true);

        validator.validateStudent(student);

        validator.validateClassroomId(dto.classroomId());

        ClassroomModel classroom = findClassroomByIdAndActive(dto.classroomId(), true);

        student.setClassroom(classroom);

        repository.flush();

        return UserMapper.toResponse(student);
    }

    @Transactional
    public void removeClassroom(UUID id) {
        UserModel student = findModelById(id);

        validator.validateStudent(student);

        student.setClassroom(null);
    }

    @Transactional
    public void deactivate(UUID id) {
        UserModel user = findModelByIdAndActive(id, true);

        validator.validateForDeactivate(user);

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

    public UserModel findModelByIdAndActive(UUID id, boolean active) {
        return repository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("User not found!", "No " + (active ? "active" : "inactive") + " user found with id: " + id, HttpStatus.NOT_FOUND));
    }

    public UserModel findModelById(UUID id) {
        return repository.findById(id)
                .orElseThrow(()-> new ExceptionGeneric("User not found!", "No user found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private RoleModel findRoleByName(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ExceptionGeneric("Role not found!", "No role found with name: " + roleName, HttpStatus.NOT_FOUND));
    }

    private ClassroomModel findClassroomByIdAndActive(UUID id, boolean active) {
        return classroomRepository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("Classroom not found!", "No " + (active ? "active" : "inactive") + " classroom found with id: " + id, HttpStatus.NOT_FOUND));
    }

}
