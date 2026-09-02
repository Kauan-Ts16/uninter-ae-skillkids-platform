package com.kauanrodrigues.backend.mapper;

import com.kauanrodrigues.backend.dto.user.UserPatchDto;
import com.kauanrodrigues.backend.dto.user.UserPostDto;
import com.kauanrodrigues.backend.dto.user.UserResponseDto;
import com.kauanrodrigues.backend.dto.user.TeacherStudentResponseDto;
import com.kauanrodrigues.backend.model.ClassroomModel;
import com.kauanrodrigues.backend.model.UserModel;

public class UserMapper {

    public static UserModel toModel(UserPostDto input, ClassroomModel classroom) {
        UserModel output = new UserModel();

        output.setName(input.name());
        output.setEmail(input.email());
        output.setClassroom(classroom);

        return output;
    }

    public static void updateModel(UserPatchDto input, UserModel output) {
        if (input.name() != null) {
            output.setName(input.name());
        }

        if (input.email() != null) {
            output.setEmail(input.email());
        }
    }

    public static UserResponseDto toResponse(UserModel user) {
        ClassroomModel classroom = user.getClassroom();

        return new UserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getRoleName(),
                classroom != null ? classroom.getId() : null,
                classroom != null ? classroom.getName() : null,
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public static TeacherStudentResponseDto toTeacherStudentResponse(UserModel user) {
        return new TeacherStudentResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isActive()
        );
    }

}
