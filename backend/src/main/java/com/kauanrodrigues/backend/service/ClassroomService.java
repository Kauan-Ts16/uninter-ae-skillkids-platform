package com.kauanrodrigues.backend.service;

import com.kauanrodrigues.backend.dto.classroom.ClassroomPatchDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomPostDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherPatchDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ClassroomMapper;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.UserModel;
import com.kauanrodrigues.backend.repository.ClassroomRepository;
import com.kauanrodrigues.backend.repository.UserRepository;
import com.kauanrodrigues.backend.validation.classroom.ClassroomValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository repository;

    private final UserRepository userRepository;

    private final ClassroomValidator validator;


    @Transactional
    public ClassroomResponseDto save(ClassroomPostDto dto) {
        UserModel teacher = null;

        if (dto.teacherId() != null) {
            teacher = findUserByIdAndActive(dto.teacherId(), true);
        }

        validator.validateForCreate(dto, teacher);

        ClassroomModel classroom = ClassroomMapper.toModel(dto, teacher);

        classroom = repository.saveAndFlush(classroom);

        return ClassroomMapper.toResponse(classroom);
    }

    @Transactional
    public void delete(UUID id) {
        ClassroomModel classroom = findModelById(id);

        validator.validateForDelete(classroom);

        repository.delete(classroom);
    }

    @Transactional
    public ClassroomResponseDto update(UUID id, ClassroomPatchDto dto) {
        ClassroomModel classroom = findModelByIdAndActive(id, true);

        validator.validateForUpdate(dto, classroom);

        ClassroomMapper.updateModel(dto, classroom);

        repository.flush();

        return ClassroomMapper.toResponse(classroom);
    }

    @Transactional
    public ClassroomResponseDto updateTeacher(UUID id, TeacherPatchDto teacherDto) {
        ClassroomModel classroom = findModelByIdAndActive(id, true);

        validator.validateTeacherId(teacherDto.teacherId());

        UserModel teacher = findUserByIdAndActive(teacherDto.teacherId(), true);

        validator.validateTeacher(teacher);

        classroom.setTeacher(teacher);

        repository.flush();

        return ClassroomMapper.toResponse(classroom);
    }

    @Transactional
    public void removeTeacher(UUID id) {
        ClassroomModel classroom = findModelByIdAndActive(id, true);

        classroom.setTeacher(null);
    }

    @Transactional
    public void deactivate(UUID id) {
        ClassroomModel classroom = findModelByIdAndActive(id, true);

        classroom.setActive(false);
    }

    @Transactional
    public void activate(UUID id) {
        ClassroomModel classroom = findModelByIdAndActive(id, false);

        classroom.setActive(true);
    }

    public List<ClassroomResponseDto> findAll() {
        return repository.findAll()
                .stream()
                .map(ClassroomMapper::toResponse)
                .toList();
    }

    public List<ClassroomResponseDto> findAllActive() {
        return repository.findAllByActive(true)
                .stream()
                .map(ClassroomMapper::toResponse)
                .toList();
    }

    public List<ClassroomResponseDto> findAllInactive() {
        return repository.findAllByActive(false)
                .stream()
                .map(ClassroomMapper::toResponse)
                .toList();
    }

    public ClassroomResponseDto findActiveById(UUID id) {
        return ClassroomMapper.toResponse(findModelByIdAndActive(id, true));
    }

    public ClassroomResponseDto findInactiveById(UUID id) {
        return ClassroomMapper.toResponse(findModelByIdAndActive(id, false));
    }

    private ClassroomModel findModelById(UUID id) {
        return repository.findById(id)
                .orElseThrow(()-> new ExceptionGeneric("Classroom not found!", "No classroom found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private ClassroomModel findModelByIdAndActive(UUID id, boolean active) {
        return repository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("Classroom not found!", "No " + (active ? "active" : "inactive") + " classroom found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private UserModel findUserByIdAndActive(UUID id, boolean active) {
        return userRepository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("User not found!", "No " + (active ? "active" : "inactive") + " user found with id: " + id, HttpStatus.NOT_FOUND));
    }

}
