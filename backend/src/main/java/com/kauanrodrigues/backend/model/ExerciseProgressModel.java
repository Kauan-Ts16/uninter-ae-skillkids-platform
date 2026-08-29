package com.kauanrodrigues.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tb_exercise_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "exercise_id"}))
public class ExerciseProgressModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "exercise_progress_id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private UserModel student;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private ExerciseModel exercise;

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(name = "last_answered_at", nullable = false)
    private LocalDateTime lastAnsweredAt;

}
