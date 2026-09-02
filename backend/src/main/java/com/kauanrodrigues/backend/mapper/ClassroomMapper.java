package com.kauanrodrigues.backend.mapper;

import com.kauanrodrigues.backend.dto.classroom.ClassroomPatchDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomPostDto;
import com.kauanrodrigues.backend.dto.classroom.ClassroomResponseDto;
import com.kauanrodrigues.backend.dto.classroom.TeacherClassroomPostDto;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.UserModel;

public class ClassroomMapper {

    public static ClassroomModel toModel(ClassroomPostDto input, UserModel teacher) {
        ClassroomModel output = new ClassroomModel();

        output.setName(input.name());
        output.setTeacher(teacher);

        return output;
    }

    public static ClassroomModel toModel(TeacherClassroomPostDto input, UserModel teacher) {
        ClassroomModel output = new ClassroomModel();

        output.setName(input.name());
        output.setTeacher(teacher);

        return output;
    }

    public static void updateModel(ClassroomPatchDto input, ClassroomModel output) {
        output.setName(input.name());
    }

    public static ClassroomResponseDto toResponse(ClassroomModel classroom) {
        UserModel teacher = classroom.getTeacher();

        return new ClassroomResponseDto(
                classroom.getId(),
                classroom.getName(),
                classroom.getJoinCode(),
                teacher != null ? teacher.getId() : null,
                teacher != null ? teacher.getName() : null,
                classroom.isActive(),
                classroom.getCreatedAt(),
                classroom.getUpdatedAt()
        );
    }

}
