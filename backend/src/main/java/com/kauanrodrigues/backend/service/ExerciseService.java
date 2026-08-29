package com.kauanrodrigues.backend.service;

import com.kauanrodrigues.backend.dto.exercise.ExerciseOptionsPatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePatchDto;
import com.kauanrodrigues.backend.dto.exercise.ExercisePostDto;
import com.kauanrodrigues.backend.dto.exercise.ExerciseResponseDto;
import com.kauanrodrigues.backend.exception.ExceptionGeneric;
import com.kauanrodrigues.backend.mapper.ExerciseMapper;
import com.kauanrodrigues.backend.model.CourseModel;
import com.kauanrodrigues.backend.model.ExerciseModel;
import com.kauanrodrigues.backend.repository.ExerciseRepository;
import com.kauanrodrigues.backend.validation.exercise.ExerciseValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository repository;

    private final ExerciseValidator validator;

    private final CourseService courseService;


    @Transactional
    public ExerciseResponseDto save(ExercisePostDto dto) {
        validator.validateForCreate(dto);

        CourseModel course = courseService.findModelById(dto.courseId());

        ExerciseModel exercise = ExerciseMapper.toModel(dto, course);

        Integer sequence = findNextSequence(course.getId());
        exercise.setSequence(sequence);

        exercise = repository.saveAndFlush(exercise);

        return ExerciseMapper.toResponse(exercise);
    }

    @Transactional
    public void delete(UUID id) {
        ExerciseModel exercise = findModelById(id);

        validator.validateForDelete(exercise);

        UUID courseId = exercise.getCourse().getId();
        Integer deletedSequence = exercise.getSequence();

        repository.delete(exercise);
        repository.flush();

        List<ExerciseModel> exercises =
                repository.findAllByCourseIdOrderBySequenceAsc(courseId);

        for (ExerciseModel currentExercise : exercises) {
            if (currentExercise.getSequence() > deletedSequence) {
                currentExercise.setSequence(currentExercise.getSequence() - 1);
                repository.flush();
            }
        }
    }

    @Transactional
    public ExerciseResponseDto update(UUID id, ExercisePatchDto dto) {
        ExerciseModel exercise = findModelByIdAndActive(id, true);

        validator.validateForUpdate(dto);

        ExerciseMapper.updateModel(dto, exercise);

        repository.flush();

        return ExerciseMapper.toResponse(exercise);
    }

    @Transactional
    public ExerciseResponseDto updateOptions(UUID id, ExerciseOptionsPatchDto dto) {
        ExerciseModel exercise = findModelByIdAndActive(id, true);

        validator.validateForOptionsUpdate(dto);

        boolean optionsChanged =
                !Objects.equals(exercise.getOptions(), dto.options());

        boolean correctOptionChanged =
                !Objects.equals(
                        exercise.getCorrectOptionIndex(),
                        dto.correctOptionIndex()
                );

        if (optionsChanged || correctOptionChanged) {
            validator.validateOptionsChange(exercise);
        }

        if (optionsChanged) {
            exercise.setOptions(dto.options());
        }

        if (correctOptionChanged) {
            exercise.setCorrectOptionIndex(dto.correctOptionIndex());
        }

        repository.flush();

        return ExerciseMapper.toResponse(exercise);
    }

    @Transactional
    public void deactivate(UUID id) {
        ExerciseModel exercise = findModelByIdAndActive(id, true);

        exercise.setActive(false);
    }

    @Transactional
    public void activate(UUID id) {
        ExerciseModel exercise = findModelByIdAndActive(id, false);

        exercise.setActive(true);
    }

    @Transactional
    public List<ExerciseResponseDto> findAll() {
        return repository.findAll()
                .stream()
                .map(ExerciseMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<ExerciseResponseDto> findAllActive() {
        return repository.findAllByActive(true)
                .stream()
                .map(ExerciseMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<ExerciseResponseDto> findAllInactive() {
        return repository.findAllByActive(false)
                .stream()
                .map(ExerciseMapper::toResponse)
                .toList();
    }

    @Transactional
    public List<ExerciseResponseDto> findAllByCourseId(UUID courseId) {
        courseService.findModelById(courseId);

        return repository.findAllByCourseIdOrderBySequenceAsc(courseId)
                .stream()
                .map(ExerciseMapper::toResponse)
                .toList();
    }

    @Transactional
    public ExerciseResponseDto findActiveById(UUID id) {
        return ExerciseMapper.toResponse(findModelByIdAndActive(id, true));
    }

    @Transactional
    public ExerciseResponseDto findInactiveById(UUID id) {
        return ExerciseMapper.toResponse(findModelByIdAndActive(id, false));
    }

    public ExerciseModel findModelByIdAndActive(UUID id, boolean active) {
        return repository.findByIdAndActive(id, active)
                .orElseThrow(() -> new ExceptionGeneric("Exercise not found!", "No " + (active ? "active" : "inactive") + " exercise found with id: " + id, HttpStatus.NOT_FOUND));
    }

    private ExerciseModel findModelById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ExceptionGeneric("Exercise not found!", "No exercise found with id: " + id, HttpStatus.BAD_REQUEST));
    }

    private Integer findNextSequence(UUID courseId) {
        return repository.findTopByCourseIdOrderBySequenceDesc(courseId)
                .map(exercise -> exercise.getSequence() + 1)
                .orElse(1);
    }

}
