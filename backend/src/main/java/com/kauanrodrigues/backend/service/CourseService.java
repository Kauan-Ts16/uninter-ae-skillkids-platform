package com.kauanrodrigues.backend.service;

import com.kauanrodrigues.backend.dto.course.CoursePatchDto;
import com.kauanrodrigues.backend.dto.course.CoursePostDto;
import com.kauanrodrigues.backend.dto.course.CourseResponseDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.CourseMapper;
import com.kauanrodrigues.backend.model.CourseModel;
import com.kauanrodrigues.backend.repository.CourseRepository;
import com.kauanrodrigues.backend.validation.course.CourseValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repository;

    private final CourseValidator validator;


    @Transactional
    public CourseResponseDto save(CoursePostDto dto) {
        validator.validateForCreate(dto);

        CourseModel course = CourseMapper.toModel(dto);

        course = repository.saveAndFlush(course);

        return CourseMapper.toResponse(course);
    }

    @Transactional
    public void delete(UUID id) {
        CourseModel course = findModelById(id);

        validator.validateDelete(course);

        repository.delete(course);
    }

    @Transactional
    public CourseResponseDto update(UUID id, CoursePatchDto dto) {
        CourseModel course = findModelByIdAndActive(id, true);

        validator.validateForUpdate(dto, course);

        CourseMapper.updateModel(dto, course);

        repository.flush();

        return CourseMapper.toResponse(course);
    }

    @Transactional
    public void deactivate(UUID id) {
        CourseModel course = findModelByIdAndActive(id, true);

        course.setActive(false);
    }

    @Transactional
    public void activate(UUID id) {
        CourseModel course = findModelByIdAndActive(id, false);

        course.setActive(true);
    }

    public List<CourseResponseDto> findAll() {
        return repository.findAll()
                .stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    public List<CourseResponseDto> findAllActive() {
        return repository.findAllByActive(true)
                .stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    public List<CourseResponseDto> findAllInactive() {
        return repository.findAllByActive(false)
                .stream()
                .map(CourseMapper::toResponse)
                .toList();
    }

    public CourseResponseDto findActiveById(UUID id) {
        return CourseMapper.toResponse(findModelByIdAndActive(id, true));
    }

    public CourseResponseDto findInactiveById(UUID id) {
        return CourseMapper.toResponse(findModelByIdAndActive(id, false));
    }

    public CourseModel findModelById(UUID id) {
        return repository.findById(id)
                .orElseThrow(()-> new ExceptionGeneric("Course not found!", "No course found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private CourseModel findModelByIdAndActive(UUID id, boolean active) {
        return repository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("Course not found!", "No " + (active ? "active" : "inactive") + " course found with id: " + id, HttpStatus.NOT_FOUND));
    }

}
